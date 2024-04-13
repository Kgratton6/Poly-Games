import json
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from functools import wraps
from .models import BaseSocketConsumer, TableManager
import json
import time
User = get_user_model()

import logging
logger = logging.getLogger(__name__) # use logger.debug()

def is_turn(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        table = self.table_manager.get_table(self.roomId)
        if table and table.is_turn(self.token):
            self.table = table # get the table 
            return func(self, *args, **kwargs)
        else:
            self.emit('error', 'It\'s not your turn to play!')
    return wrapper

class ThirtyOneConsumer(BaseSocketConsumer): 

    table_manager = TableManager() # shaded instance  # ! problem : works dont have the same instance

    # Needs to match SendEvents in the consts of client
    eventHandlers = {
        'play': 'play',
        'getCards': 'get_cards',
        'drawDeck': 'draw_card',
        'drawDump': 'draw_dump',
        'dumpCard': 'dump_card',
        'startGame': 'start_game',
        'getStateInfo': 'get_state_info',
        'finishGame': 'finish_game',
    }

    def connect(self):
        if(self.verify_connection()):
            self.accept()
            self.send_table_data()
        else:
            self.connection_error()
    
    def disconnect(self, code):
        return super().disconnect(code)

    def receive(self, text_data=None):
        message = json.loads(text_data)
        event = message.get('event')
        data = message.get('data') or 'No data'

        handler_name = self.eventHandlers.get(event)
        if handler_name:
            getattr(self, handler_name)(data)
        else:
            self.emit('error', 'Server receved an unexpected event')

    def verify_connection(self):
        ws, tableId, user_token = self.scope['path_remaining'].split('/')
        token = Token.objects.get(key=user_token)
        self.token = token
        self.add_to_group(tableId, token)
        self.table_manager.create_table(tableId) # ne fais pas de repetititon
        table = self.table_manager.get_table(self.roomId)
        self.isNewPlayer = self.table_manager.is_new_player(tableId, token)
        if table.gameState != 'waiting' and self.isNewPlayer:
            self.connectionErrorMessage = 'Sorry, the game has already started.'
            return False
        self.isNewPlayer = self.table_manager.add_player(tableId, token) # ne fais pas de repetititon
        return True 
    
    def connection_error(self):
        self.accept()
        self.emit('quickedOut', 'Game has already started!')
        #self.close()

    def send_table_data(self):

        table = self.table_manager.get_table(self.roomId)
        self.table = table
        self.emit('gameState', table.gameState)

        # if table.gameState == 'waiting':
        #     self.get_waiting_information(table)
        # elif table.gameState == 'game':
        #     self.get_game_information(table)
        # elif table.gameState == 'results':
        #     self.get_results_information(table)

    def get_waiting_information(self, table):

        if self.isNewPlayer:
            self.broadcast_exept('newPlayer', table.get_player(self.token))
            self.emit('connectionConfirmation', 'Welcome to the table : ' + self.roomId) 

        self.emit('waitingInformation', table.get_Players())
        if table.is_host(self.token):
            self.emit('host', 'You are the game host.')

        self.isNewPlayer = False

    def get_game_information(self, table):
        self.emit('gameInformation',  table.get_Game_Info())
        self.emit('cards', table.get_current_cards_player(self.token))
        self.emit('newReturnedCard', table.get_start_dump())

        if self.isNewPlayer:
            cards_to_send = table.get_cards_player(self.token) # au debut on donne des cartes
            if cards_to_send:
                self.emit('cards', cards_to_send)
            else:
                self.emit('error', 'The Deck is empty')

    def get_results_information(self, table):
        None

    @is_turn
    def start_game(self, data):
        if self.table.is_host(self.token):
            self.table.gameState = 'game'
            self.broadcast('gameState', 'game')
            self.table.give_cards()

    def finish_game(self, data):
        if self.table.is_host(self.token):
            self.table.gameState = 'results'
            self.broadcast('gameState', 'results')

    def get_state_info(self, data):
        if self.table.gameState == 'waiting':
            self.get_waiting_information(self.table)
        elif self.table.gameState == 'game':
            self.get_game_information(self.table)
        elif self.table.gameState == 'results':
            self.get_results_information(self.table)

    @is_turn
    def play(self, data):
        self.broadcast('newTurn', self.table.next_turn())

    @is_turn
    def draw_card(self, data):
        card = self.table.draw_card()
        if card:
            self.emit('newCard', card)
            #self.emit('deck', self.table.getDeck())
        else:
            self.emit('error', 'The Deck is empty')

    @is_turn
    def draw_dump(self, data):
        top_dump = self.table.draw_dump()  # card on top of the dump
        if top_dump:
            self.emit('newCard', top_dump)
        else:
            self.emit('error', 'The dump is empty, cant draw a card')
            return

        under_top_dump = self.table.get_start_dump() # card under the card we just took
        if under_top_dump:
            self.broadcast('newReturnedCard', self.table.get_start_dump())
        else:
            self.emit('error', 'The dump is now empty, you took the last card!')
            self.broadcast('newReturnedCard', { "value": 0,"color": 'null', })
    
    @is_turn
    def dump_card(self, data):
        dumpted_card = self.table.dump_card(int(data))
        self.broadcast('newReturnedCard', dumpted_card)
        self.emit('cards', self.table.get_current_cards())







