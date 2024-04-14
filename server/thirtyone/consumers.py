import json
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from functools import wraps
from .enums import *
from .models import BaseSocketConsumer, TableManager, NO_CARD
import json
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

class ThirtyOneConsumer(BaseSocketConsumer):

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

    def reconnection(self):
        self.emit(SendEvents.NewGameState.value, self.table.gameState)

    def getStateInfo(self, data):
        if self.table.gameState == GameState.Waiting.value:
            self.getWaitingInformation()
        elif self.table.gameState == GameState.Game.value:
            self.getGameInformation()
        elif self.table.gameState == GameState.Results.value:
            self.getResultsInformation()

    def getWaitingInformation(self):
        self.emit(SendEvents.WaitingInformation.value, self.table.getPlayers())
        if self.table.isHost(self.user):
            self.emit(SendEvents.Host.value, 'You are the game host.')

    def getGameInformation(self):
        self.emit(SendEvents.GameInformation.value,  self.table.getGameInfo())
        self.emit(SendEvents.Cards.value, self.table.getCards(self.user))
        self.emit(SendEvents.NewReturnedCard.value, self.table.getReturnedCard())

    def getResultsInformation(self):
        self.emit(SendEvents.WinnerName.value, self.table.winnerName)
        self.emit(SendEvents.WinnerCards.value, self.table.winnerCards)

    def quitGame(self, data):
        needNewHost = self.tableManager.removePlayer(self.table.tableId, self.user)
        self.multicast(SendEvents.NewTurn.value, self.table.turn)
        self.multicast(SendEvents.Players.value,  self.table.getPlayers())
        self.multicast(SendEvents.PlayerLeft.value, self.user.username)

    @isHost
    def startGame(self, data):
        self.table.distributeCards()
        self.table.gameState = GameState.Game.value
        self.broadcast(SendEvents.NewGameState.value, GameState.Game.value)

    # @isHost
    # def finishGame(self, data):
    #     self.table.gameState = GameState.Results.value
    #     self.broadcast(SendEvents.NewGameState.value, GameState.Results.value)

    # @isTurn
    # def play(self, data):
    #     self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())

    @isTurn
    def drawDeck(self, data):
        if not self.table.alreadyDrawn:
            self.table.alreadyDrawn = True
            card = self.table.drawDeck()
            if card:
                self.emit(SendEvents.NewCard.value, card)
            else:
                self.emit(SendEvents.Error.value, 'The Deck is empty.')
                self.broadcast(SendEvents.NewReturnedCard.value, NO_CARD)
        else:
            self.emit(SendEvents.Error.value, 'You already took a card, now dump one')

    @isTurn
    def drawDump(self, data):
        if not self.table.alreadyDrawn:
            self.table.alreadyDrawn = True

            cardDump = self.table.drawDump() 
            underTopDump = self.table.getReturnedCard()
            if not cardDump:
                self.emit(SendEvents.Error.value, 'The dump is empty.')
                return
            if underTopDump:
                self.broadcast(SendEvents.NewReturnedCard.value, underTopDump)
            else:
                self.emit(SendEvents.Error.value, 'The dump is now empty, you took the last card.')
                self.broadcast(SendEvents.NewReturnedCard.value, NO_CARD)
            self.emit(SendEvents.NewCard.value, cardDump)
        else:
            self.emit(SendEvents.Error.value, 'You already took a card, now dump one')
    
    @isTurn
    def dumpCard(self, data):
        if self.table.alreadyDrawn:
            self.table.alreadyDrawn = False
            dumpedCard = self.table.dumpCard(int(data))
            self.broadcast(SendEvents.NewReturnedCard.value, dumpedCard)
            self.emit(SendEvents.Cards.value, self.table.getCards(self.user))

            wonGame = self.table.calculateScore(self.user)
            if wonGame:
                self.table.gameState = GameState.Results.value
                self.table.winnerCards = self.table.getCards(self.user)
                self.table.winnerName = self.user.username
                self.broadcast(SendEvents.NewGameState.value, GameState.Results.value)
            else: 
                self.broadcast(SendEvents.NewTurn.value, self.table.nextTurn())
        else:
            self.emit(SendEvents.Error.value, 'You need to draw a card first')







