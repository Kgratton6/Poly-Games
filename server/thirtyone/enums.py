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
    Cards = 'cards'
    NewCard = 'newCard'
    NewReturnedCard = 'newReturnedCard'
    NewTurn = 'newTurn'

    ResultsInformation = 'resultsInformation'
    WinnerName = 'winnerName'
    WinnerCards = 'winnerCards'