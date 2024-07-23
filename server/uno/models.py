from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .classes import *
from .enums import GameState
import json
import threading
import time
from datetime import datetime, timedelta

class BaseSocketConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def emit(self, event, data):
        self.send(text_data=json.dumps({'event': event, 'data': data}))

    def broadcast(self, event, data):
        async_to_sync(self.channel_layer.group_send)(self.table.tableId, {'type': 'emitBroad', 'event': event, 'data': data})

    def emitBroad(self, event):
        self.emit(event['event'], event['data'])

    def multicast(self, event, data):
        async_to_sync(self.channel_layer.group_send)(self.table.tableId, {'type': 'emitMulti', 'sender': self.channel_name, 'event': event, 'data': data})

    def emitMulti(self, event):
        if self.channel_name != event['sender']:
            self.emit(event['event'], event['data'])

    def addToChannel(self):
        async_to_sync(self.channel_layer.group_add)(self.table.tableId,self.channel_name)

    def removeFromChannel(self):
        if self.table.tableId:
            async_to_sync(self.channel_layer.group_discard)(self.table.tableId, self.channel_name)

class Player():
    def __init__(self, token):
        self.user = token
        self.nCards = 0   
        self.cards = []

class Text:
    def __init__(self, sender, message):
        self.sender = sender
        self.message = message

class Chats:
    def __init__(self):
        self.messages = []

    def add_message(self, sender, message):
        text = Text(sender, message)
        self.messages.append(text)

    def getChats(self):
        return [getTextToSend(message) for message in self.messages]


class TableUno():

    def __init__(self, tableId):
        self.tableId = tableId
        self.players = []
        self.finishedPlayers = []
        self.deck = Deck()
        self.turn = 0
        self.gameState = GameState.Waiting.value
        self.created_at = datetime.now()
        self.chats = Chats()

        self.winnerName = None
        self.alreadyDrawn = False

        self.isPLus2Section = False
        self.isDrawing2Section = False
        self.isPLus4Section = False
        self.isDrawing4Section = False
        self.totalDrawAccumulated = 0

        self.lastSpecialColor = ''
        self.turnDirection = True # True is counter-clock, False is clock-wise

    def addPlayer(self, user):
        self.players.append(Player(user))
        
    def isNewPlayer(self, user):
        return not any(player.user == user for player in self.players)
    
    def removePlayer(self, user):
        for index, player in enumerate(self.players):
            if player.user == user:
                self.players.remove(player)
                if index < self.turn:
                    self.turn -= 1
                return index == 0
        return False

    def getPlayer(self, user):
        for player in self.players:
            if player.user == user:
                return getPlayerToSend(player)
        return None

    def getPlayers(self):
        return [getPlayerToSend(player) for player in self.players]
    
    def getGameInfo(self):
        return { "tableId": self.tableId, "turn": self.turn, "players": self.getPlayers() }
    
    def isHost(self, user):
        return self.players[0].user == user
    
    def isTurn(self, user):
        return self.players[self.turn].user == user
    
    def nextTurn(self):
        self.alreadyDrawn = False
        while True:
            if self.turnDirection:
                self.turn = (self.turn + 1) % len(self.players)
            else:
                self.turn = (self.turn - 1) % len(self.players)
                if self.turn < 0:
                    self.turn = len(self.players) - 1

            if self.players[self.turn].user.username not in self.finishedPlayers:
                break
        return self.turn
    
    def distributeCards(self):
        for player in self.players:
            player.cards = self.deck.drawCards(7)

    def getCards(self, user):
        for player in self.players:
            if player.user == user:
                return getCardsToSend(player.cards)
        return None
    
    def getDump(self):
        return getCardsToSend(self.deck.dump)

    def drawCard(self):
        player = self.players[self.turn]
        card = self.deck.drawCard()
        if card and player:
            player.cards.append(card)
            return getCardToSend(card)
        return None

    def getDumpedCardValue(self, index):
        player = self.players[self.turn]
        return player.cards[index]
    
    def canDump(self, card):
        last_card = self.deck.dump[-1]
        if card.color == self.lastSpecialColor:
            return True
        if card.value == 13 or card.value == 14:
            return True
        return last_card.color == card.color or last_card.value == card.value or self.lastSpecialColor == card.color

    def dumpCard(self, index):
        self.lastSpecialColor = 'no color'
        player = self.players[self.turn]
        card = player.cards.pop(index)
        self.deck.dumpCard(card)
        return getCardToSend(card)
    
    def isLastPlayerCard(self):
        player = self.players[self.turn]
        return len(player.cards) == 1
    def isPlayerFinished(self):
            player = self.players[self.turn]
            return len(player.cards) == 0
    def isLastPlayerFinished(self):
        return len(self.finishedPlayers) == len(self.players) - 1
    
    def addRemainingPlayer(self):
        for player in self.players:
            if player.user.username not in self.finishedPlayers:
                self.finishedPlayers.append(player.user.username)

class TableManager():
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.tables = {}
        self.tableIdCount = 0
        self.cleanup_interval = 3600
        self.start_cleanup_thread()

    def start_cleanup_thread(self):
        thread = threading.Thread(target=self.cleanup_tables, daemon=True)
        thread.start()

    def cleanup_tables(self):
        while True:
            now = datetime.now()
            tables_to_delete = [
                tableId for tableId, table in self.tables.items()
                if now - table.created_at > timedelta(hours=12)
            ]
            print('Deleting aniactive tables')
            for tableId in tables_to_delete:
                self.deleteTable(tableId)
            time.sleep(self.cleanup_interval)

    def getTable(self, tableId):
        return self.tables.get(tableId)

    def createTable(self):
        count = str(self.tableIdCount)
        if not self.tables.get(count):
            self.tables[count] = TableUno(count)
            self.tableIdCount += 1
        return self.tables[count]
    
    def deleteTable(self, tableId):
        if tableId in self.tables:
            del self.tables[tableId]

    def removePlayer(self, tableId, user):
        table = self.getTable(tableId)
        if table:
            needNewHost = table.removePlayer(user)
            if len(table.players) == 0:
                self.deleteTable(tableId)
            return needNewHost