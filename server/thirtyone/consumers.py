import json
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from functools import wraps
from .models import BaseSocketConsumer, TableManager
import json
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

    table_manager = TableManager() # shaded instance 

    # Needs to match SendEvents in the consts of client
    eventHandlers = {
        'broadcastMessage': 'broadcast_message',
        'broadcastMessageExept': 'broadcast_message_exept',
        'play': 'play',
        'getCards': 'get_cards',
        'drawDeck': 'draw_card',
        'drawDump': 'draw_dump',
        'dumpCard': 'dump_card',
    }

    def connect(self):
        if(self.verify_connection()):
            self.accept()
            self.send_table_data()
    
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

    
    # TODO : verifier la token si il est dans une room, si oui : ajouter dans la room
    # TODO : verifier si c'est : new player, refresh, si la room est complete ou commencé
    def verify_connection(self):
        tableId, user_token = self.scope['path_remaining'].split('/')
        token = Token.objects.get(key=user_token)
        self.token = token
        self.add_to_group(tableId, token)
        self.table_manager.create_table(tableId) # ne fais pas de repetititon
        self.isNewPlayer = self.table_manager.add_player(tableId, token) # ne fais pas de repetititon
        if self.isNewPlayer:
            table = self.table_manager.get_table(tableId)
            self.broadcast_exept('newPlayer', table.get_player(self.token))
        return True 

    # TODO : envoyer les donnés de la room (players) si entre dans la room
    # TODO : emit le state de la room si refresh 
    def send_table_data(self):
        self.emit('connectionConfirmation', 'Welcome to the table : ' + self.roomId) 
        table = self.table_manager.get_table(self.roomId)
        self.emit('gameInformation',  table.get_all_players())
        self.emit('deck', table.getDeck())
        self.emit('newReturnedCard', table.get_start_dump())
        if self.isNewPlayer:
            cards_to_send = table.get_cards_player(self.token) # au debut on donne des cartes
            if cards_to_send:
                self.emit('cards', cards_to_send)
                self.emit('deck', table.getDeck())
            else:
                self.emit('error', 'The Deck is empty')
        else:
            self.emit('cards', table.get_current_cards_player(self.token))
            self.emit('deck', table.getDeck())

    
    # Functions to handle the receved messages
    def broadcast_message(self, data):
        self.broadcast('newMessage', 'message broadcast : ' + data)

    def broadcast_message_exept(self, data):
        self.broadcast_exept('newMessage', 'message broadcast exept : ' + data)

    @is_turn
    def play(self, data):
        self.broadcast('newTurn', self.table.next_turn())

    # @is_turn
    # def get_cards(self, data):
    #     table = self.table_manager.get_table(self.roomId)
    #     cards = self.table.get_cards()
    #     if cards:
    #         self.emit('cards', cards)
    #         self.emit('deck', self.table.getDeck())
    #     else:
    #         self.emit('error', 'The Deck is empty')
    
    @is_turn
    def draw_card(self, data):
        card = self.table.draw_card()
        if card:
            self.emit('newCard', card)
            self.emit('deck', self.table.getDeck())
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





