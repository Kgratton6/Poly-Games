from enum import Enum

class GameState(Enum):
    Waiting = 'waiting'
    Game = 'game'
    Results = 'results'

class SendEvents(Enum):
    ConnectionConfirmation = 'connectionConfirmation'
    Error = 'error'
    NewGameState = 'gameState'
    QuickedOut = 'quickedOut'
    PlayerLeft = 'playerLeft',
    Players = 'players',

    WaitingInformation = 'waitingInformation'
    NewPlayer = 'newPlayer'
    Host = 'host'

    GameInformation = 'gameInformation'
    NewTurn = 'newTurn'
    Cards = 'cards'
    Dump = 'dump'
    NewCard = 'newCard'
    DrawDeck = 'drawDeck',
    DumpCard = 'dumpCard',

    LastTurn = 'lastTurn',

    ResultsInformation = 'resultsInformation'
    WinnerName = 'winnerName'
    WinnerCards = 'winnerCards'

    NewChat = 'newChat'
    Uno = 'uno'
    Winners = 'winners'
    SpecialColor = 'specialColor'