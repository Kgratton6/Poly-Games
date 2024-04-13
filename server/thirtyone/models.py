from django.db import models
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import random
import copy
import json

import logging
logger = logging.getLogger(__name__) # use logger.debug()

class BaseSocketConsumer(WebsocketConsumer):

    def emit_event(self, event):
        self.send(text_data=json.dumps({
            'event': event['event'],
            'data': event['data']
        }))

    def broadcast(self, event, data):
        async_to_sync(self.channel_layer.group_send)(
            self.roomId, {'type': 'emit_event', 'event': event, 'data': data}
        )

    def broadcast_exept(self, event, data):
        async_to_sync(self.channel_layer.group_send)(
            self.roomId, 
            {'type': 'emit_event_exept', 'sender_name': self.channel_name, 'event': event, 'data': data}
        )

    def emit_event_exept(self, event):
        if self.channel_name != event['sender_name']:
            self.send(text_data=json.dumps({
                'event': event['event'],
                'data': event['data'],
            }))
    
    def emit(self, event, data):
        self.send(text_data=json.dumps({
            'event': event, 
            'data': data,
        }))


    # TODO : à la créeation d'un group, assigner une table31
    def add_to_group(self, roomId, token):
        self.roomId = roomId
        self.token = token
        # await self.channel_layer.group_add(
        #     self.roomId,
        #     self.channel_name
        # )
        async_to_sync(self.channel_layer.group_add)(
            self.roomId,
            self.channel_name
        )

# TODO : only temporaty, switch to Redis after : group_channels = async_to_sync(channel_layer.group_channels)(self.roomId)
def getPlayerToSend(player):
    return { 
        "username": player.user.username,
        "icon": player.user.icon,
        "nCards": player.nCards,
    }

def getCardToSend(card):
    return {
        "value": card.value,
        "color": card.color,
    }

class TableManager():
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.tables = {}

    def get_table(self, table_id):
        table = self.tables.get(table_id)
        return table

    def create_table(self, table_id):
        if table_id not in self.tables:
            self.tables[table_id] = Table31(table_id)
            return True
        return False
    
    def delete_table(self, table_id):
        if table_id in self.tables:
            del self.tables[table_id]
            return True
        return False

    def remove_player(self, table_id, player_token):
        table = self.tables.get(table_id)
        if table:
            table.remove_player(player_token)
            if len(table.player) == 0:
                self.delete_table(table_id)

    def is_new_player(self, table_id, player_token):
        table = self.tables.get(table_id)
        return table.is_new_player(player_token)

    def add_player(self, table_id, player_token):
        table = self.tables.get(table_id)
        if table:
            return table.add_player(player_token)
        return False

    def get_table_all_players(self, table_id):
        return self.get_table(table_id).get_all_players()
    
class Card:
    def __init__(self, value, color):
        self.value = value
        self.color = color

CARD_COLORS = ['Hearts', 'Diamond', 'Spades', 'Clubs']
CARD_VALUES = range(1, 14)
ORGANISED_DECK = [Card(value, color) for value in CARD_VALUES for color in CARD_COLORS]

class Deck:
    def __init__(self):
        self.deck = copy.deepcopy(ORGANISED_DECK)
        self.dump = []
        self.shuffle()
        self.return_card()

    def shuffle(self):
        random.shuffle(self.deck)

    def verify_deck_size(self):
        if 1 > len(self.deck):
            random.shuffle(self.dump)
            self.deck.extend(self.dump)
            self.dump = []

    def draw_card(self):
        try:
            self.verify_deck_size()
            card_to_return = self.deck.pop(0)
            return card_to_return
        except:
            return None
    
    def draw_cards(self, number):
        drawn_cards = []
        for _ in range(number):
            card = self.draw_card()
            if card == None:
                return None
            drawn_cards.append(card)
        return drawn_cards
    
    def return_card(self):
        returned_card = self.draw_card()
        self.dump.append(returned_card)
        return returned_card
    
    def get_returned_card(self):
        try:
            returned_card = self.dump.pop()
            return returned_card
        except:
            return None
    
    def dump_card(self, card):
        self.dump.append(card)

    def get_dump_top(self):
        try:
            return self.dump[-1]
        except:
            return None



class Table31():

    def __init__(self, table_id):
        self.table_id = table_id
        self.players = []
        self.deck = Deck()
        self.turn = 0
        self.gameState = 'waiting'

    def add_player(self, player_token): # token contains the user
        if player_token not in self.players:
            player_token.nCards = 0     # add the attributes
            player_token.cards = []
            self.players.append(player_token)
            return True
        return False
    
        
    def is_new_player(self, player_token):
        if player_token not in self.players:
            return True
        return False
    
    def remove_player(self, player_token):
        if player_token in self.players:
            self.players.remove(player_token)
            return True
        return False
    
    def get_Game_Info(self):
        return { "turn": self.turn, "players": [getPlayerToSend(player_token) for player_token in self.players] }
    
    def get_Players(self):
        return [getPlayerToSend(player_token) for player_token in self.players]
    
    def get_player(self, player_token):
        for player in self.players:
            if player.user == player_token.user:
                return getPlayerToSend(player)
        return None
    
    def is_host(self, player_token):
        if self.players[0].user == player_token.user:
            return True
        return False
    
    # turn functions
    def is_turn(self, player_token):
        if len(self.players) > 0 and self.players[self.turn].user == player_token.user:
            return True
        return False
    
    def next_turn(self):
        self.turn = (self.turn + 1) % len(self.players)
        return self.turn
    
    # card functions
    def get_cards(self):
        player = self.players[self.turn]
        drawn_cards = self.deck.draw_cards(3)
        if drawn_cards:
            player.cards = drawn_cards
            return [getCardToSend(card) for card in player.cards]
        return None
    
    def get_cards_player(self, player_token):
        for player in self.players:
            if player.user == player_token.user:
                drawn_cards = self.deck.draw_cards(3)
                if drawn_cards:
                    player.cards = drawn_cards
                    return [getCardToSend(card) for card in player.cards]
                return None
        return None
    
    def get_current_cards_player(self, player_token):
        for player in self.players:
            if player.user == player_token.user:
                return [getCardToSend(card) for card in player.cards]
        return None
    
    def get_current_cards(self):
        player = self.players[self.turn]
        return [getCardToSend(card) for card in player.cards]
    
    def draw_card(self):
        player = self.players[self.turn]
        card = self.deck.draw_card()
        if card:
            player.cards.append(card)
            return getCardToSend(card)
        return None
    
    def draw_dump(self):
        player = self.players[self.turn]
        card = self.deck.get_returned_card()
        if card:  
            player.cards.append(card)
            return getCardToSend(card)
        return None
    
    def dump_card(self, index):
        player = self.players[self.turn]
        dumped_card = player.cards.pop(index)
        self.deck.dump_card(dumped_card)
        return getCardToSend(dumped_card)
    
    def get_start_dump(self):
        cardToSend = self.deck.get_dump_top()
        if cardToSend:
            return getCardToSend(cardToSend)
        else:
            return None
         
    def getDeck(self):
        return [getCardToSend(card) for card in self.deck.deck]
    
    def give_cards(self):
        for player in self.players:
            drawn_cards = self.deck.draw_cards(3)
            if drawn_cards:
                player.cards = drawn_cards
            else:
                return False
        return True


        


            

