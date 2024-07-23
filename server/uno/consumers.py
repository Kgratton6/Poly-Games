import json
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from functools import wraps
from .enums import *
from .models import BaseSocketConsumer, TableManager, NO_CARD
import json
from .classes import Card
import time
User = get_user_model()

def isTurn(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        if self.table.isTurn(self.user):
            return func(self, *args, **kwargs)
        else:
            self.emit(SendEvents.Error.value, 'It\'s not your turn to play!')
    return wrapper

def isHost(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        if self.table.isHost(self.user):
            return func(self, *args, **kwargs)
        else:
            self.emit(SendEvents.Error.value, 'You are not the table host!')
    return wrapper

class UnoConsumer(BaseSocketConsumer):

    tableManager = TableManager() 
    table = None
    user = None

    def connect(self):
        self.verifyConnection()
    
    def disconnect(self, code):
        return super().disconnect(code)

    def receive(self, text_data=None):
        message = json.loads(text_data)
        event = message.get('event')
        data = message.get('data') or 'No data'

        handlerName = getattr(self, event, None)
        if handlerName:
            handlerName(data)
        else:
            self.emit(SendEvents.Error.value, 'Server received an unexpected event.')

    def verifyConnection(self):
        ws, tableId, gameToken = self.scope['path_remaining'].split('/')
        token = Token.objects.get(key=gameToken)

        table = self.tableManager.getTable(tableId)

        self.accept()
        if not table:
            self.emit(SendEvents.QuickedOut.value, 'This table doesn\'t exist.')
            return

        isNewPlayer = table.isNewPlayer(token.user)
        if table.gameState != GameState.Waiting.value and isNewPlayer:
            self.emit(SendEvents.QuickedOut.value, 'Game has already started.')
            return

        self.user = token.user
        self.table = table
        self.addToChannel()

        if isNewPlayer:
            self.newPlayer()
        else:
            self.reconnection()

    def newPlayer(self):
        self.table.addPlayer(self.user)
        self.multicast(SendEvents.NewPlayer.value, self.table.getPlayer(self.user))
        self.emit(SendEvents.NewGameState.value, self.table.gameState)
        self.emit(SendEvents.ConnectionConfirmation.value, 'Welcome to the game.')
        self.broadcast(SendEvents.NewChat.value, self.table.chats.getChats())

    def reconnection(self):
        self.emit(SendEvents.NewGameState.value, self.table.gameState)
        self.broadcast(SendEvents.NewChat.value, self.table.chats.getChats())

    def getStateInfo(self, data):
        if self.table.gameState == GameState.Waiting.value:
            self.getWaitingInformation()
        elif self.table.gameState == GameState.Game.value:
            self.getGameInformation()
        elif self.table.gameState == GameState.Results.value:
            self.getResultsInformation()

    def sendChat(self, data):
        self.table.chats.add_message(self.user.username, data)
        self.broadcast(SendEvents.NewChat.value, self.table.chats.getChats())

    def getWaitingInformation(self):
        self.emit(SendEvents.WaitingInformation.value, self.table.getPlayers())
        if self.table.isHost(self.user):
            self.emit(SendEvents.Host.value, 'You are the game host.')

    def getGameInformation(self):
        self.emit(SendEvents.GameInformation.value,  self.table.getGameInfo())
        self.emit(SendEvents.Cards.value, self.table.getCards(self.user))
        self.emit(SendEvents.Dump.value, self.table.getDump())

    def getResultsInformation(self):
        self.emit(SendEvents.WinnerName.value, self.table.winnerName)
        self.emit(SendEvents.Winners.value, self.table.finishedPlayers)

    def quitGame(self, data):
        self.tableManager.removePlayer(self.table.tableId, self.user)
        self.multicast(SendEvents.NewTurn.value, self.table.turn)
        self.multicast(SendEvents.Players.value,  self.table.getPlayers())
        self.multicast(SendEvents.PlayerLeft.value, self.user.username)

    @isHost
    def startGame(self, data):
        self.table.distributeCards()
        self.table.gameState = GameState.Game.value
        self.broadcast(SendEvents.NewGameState.value, GameState.Game.value)

    @isTurn
    def drawCard(self, data):
        if self.table.isPLus2Section:
            self.table.isDrawing2Section = True
            self.table.totalDrawAccumulated = self.table.totalDrawAccumulated - 1

            card = self.table.drawCard()
            self.broadcast(SendEvents.DrawDeck.value, 'Draw from the deck')
            self.emit(SendEvents.NewCard.value, card)

            if self.table.totalDrawAccumulated == 0:
                self.table.isPLus2Section = False
                self.table.isDrawing2Section = False
                self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())
            return
        if self.table.isPLus4Section:
            self.table.isDrawing4Section = True
            self.table.totalDrawAccumulated = self.table.totalDrawAccumulated - 1

            card = self.table.drawCard()
            self.broadcast(SendEvents.DrawDeck.value, 'Draw from the deck')
            self.emit(SendEvents.NewCard.value, card)

            if self.table.totalDrawAccumulated == 0:
                self.table.isPLus4Section = False
                self.table.isDrawing4Section = False
                self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())
            return
        elif self.table.alreadyDrawn:
            self.emit(SendEvents.Error.value, 'You already took a card, now dump one')
            return

        self.table.alreadyDrawn = True
        card = self.table.drawCard()

        if card:
            self.broadcast(SendEvents.DrawDeck.value, 'Draw from the deck')
            self.emit(SendEvents.NewCard.value, card)
            if not self.table.canDump(Card(card['value'], card['color'])):
                self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())
                self.emit(SendEvents.Error.value, 'You can\'t play what you just draw!')
        else:
            self.emit(SendEvents.Error.value, 'The Deck is empty.')
    
    @isTurn
    def dumpCard(self, data):
        card_id = int(data.get('card', 0))
        color = data.get('color', '')
        dumpedCard = self.table.getDumpedCardValue(card_id)
        if (self.table.isPLus2Section and dumpedCard.value != 11) or self.table.isDrawing2Section or (self.table.isPLus4Section and dumpedCard.value != 14) or self.table.isDrawing4Section:
            self.emit(SendEvents.Error.value, 'You have to draw ' + str(self.table.totalDrawAccumulated) + ' cards.')
            return
        if not self.table.canDump(dumpedCard):
            self.emit(SendEvents.Error.value, 'You can\'t discard this card!')
            return
        if dumpedCard.value > 9 and self.table.isLastPlayerCard():
            self.emit(SendEvents.Error.value, 'You can\'t finish on a Special card!')
            return
    
        cardToSend = self.table.dumpCard(card_id)
        self.broadcast(SendEvents.DumpCard.value, cardToSend)
        self.emit(SendEvents.Cards.value, self.table.getCards(self.user))



        value = cardToSend['value']
        if value == 10:
            self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())
        if value == 11:
            self.table.isPLus2Section = True
            self.table.totalDrawAccumulated = self.table.totalDrawAccumulated + 2
        if value == 12:
            self.table.turnDirection = not self.table.turnDirection
            self.broadcast(SendEvents.Error.value, 'The turn is changed!')
        if value == 13:
            self.table.lastSpecialColor = color
            print(self.table.lastSpecialColor)
            self.broadcast(SendEvents.Error.value, 'Color has been changed to ' + color)
        if value == 14:
            self.table.isPLus4Section = True
            self.table.totalDrawAccumulated = self.table.totalDrawAccumulated + 4
            self.table.lastSpecialColor = color
            print(self.table.lastSpecialColor)
            self.broadcast(SendEvents.Error.value, 'Color has been changed to ' + color)



        if self.table.isLastPlayerCard():
            self.broadcast(SendEvents.Uno.value, self.user.username)
        if self.table.isPlayerFinished():
            self.table.finishedPlayers.append(self.user.username)
            self.broadcast(SendEvents.Error.value, self.user.username + ' has finished.')
        if self.table.isLastPlayerFinished():
            self.table.addRemainingPlayer()
            self.table.winnerName = self.table.finishedPlayers[0]
            self.table.gameState = GameState.Results.value
            self.broadcast(SendEvents.NewGameState.value, GameState.Results.value)
            return
        self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())

    @isTurn
    def dontDump(self, data):
        if self.table.alreadyDrawn:
            self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())
        else:
            self.emit(SendEvents.Error.value, 'If you can\t discard, draw a card first.')