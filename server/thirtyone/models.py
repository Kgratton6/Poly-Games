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


class Table31():
    max_score = 0
    winner = None

    def __init__(self, tableId):
        self.tableId = tableId
        self.players = []
        self.deck = Deck()
        self.turn = 0
        self.alreadyDrawn = False
        self.gameState = GameState.Waiting.value
        self.winnerCards = None
        self.winnerName = None
        self.created_at = datetime.now()
        self.isLastTurnIndex = -100
        self.chats = Chats()

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
        self.turn = (self.turn + 1) % len(self.players)
        return self.turn
    
    def isLastTurnFinished(self):
        return (self.isLastTurnIndex == ((self.turn + 1) % len(self.players)))
    
    def distributeCards(self):
        for player in self.players:
            player.cards = self.deck.drawCards(3)

    def getCards(self, user):
        for player in self.players:
            if player.user == user:
                return getCardsToSend(player.cards)
        return None
    
    def getDump(self):
        return getCardsToSend(self.deck.dump)

    def drawDeck(self):
        player = self.players[self.turn]
        card = self.deck.drawCard()
        if card and player:
            player.cards.append(card)
            return getCardToSend(card)
        return None
    
    def drawDump(self):
        player = self.players[self.turn]
        card = self.deck.drawDump()
        if card:  
            player.cards.append(card)
            return getCardToSend(card)
        return None
    
    def dumpCard(self, index):
        player = self.players[self.turn]
        card = player.cards.pop(index)
        self.deck.dumpCard(card)
        return getCardToSend(card)
    
    def getReturnedCard(self):
        card = self.deck.getReturnedCard()
        if card:
            return getCardToSend(card)
        else:
            return None
        
    def getCards(self, user):
        for player in self.players:
            if player.user == user:
                return getCardsToSend(player.cards)
        return None
    
    def calculateScore(self, user):
        for player in self.players:
            currentColor = player.cards[0].color
            if player.user == user:
                total_score = 0
                for card in player.cards:
                    if card.color != currentColor:
                        return False
                    total_score += self.get_card_value(card)
                if total_score == 31:
                    return True
        return False
    
    def calculateWinner(self):
        for player in self.players:

            color_count = {'Hearts': 0, 'Diamond': 0, 'Spades': 0, 'Clubs': 0}
            for card in player.cards:
                color_count[card.color] += self.get_card_value(card)
            winning_color = max(color_count, key=color_count.get)
            total_score = color_count[winning_color]

            if total_score > self.max_score:
                self.max_score = total_score
                self.winnerCards = self.getCards(player.user)
                self.winnerName = player.user.username
            

    def get_card_value(self, card):
        if 1 < card.value < 10:
            return card.value
        elif card.value == 1:
            return 11
        else:
            return 10
    
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

    def getTable(self, tableId):
        return self.tables.get(tableId)

    def createTable(self):
        count = str(self.tableIdCount)
        if not self.tables.get(count):
            self.tables[count] = Table31(count)
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


            

