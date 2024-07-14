export enum ReceveEvents {
    // general events
    ConnectionConfirmation = 'connectionConfirmation',
    Error = 'error',
    NewGameState = 'gameState',
    QuickedOut = 'quickedOut',
    PlayerLeft = 'playerLeft',
    Players = 'players',

    // waiting events
    WaitingInformation = 'waitingInformation',
    NewPlayer = 'newPlayer',
    Host = 'host',

    // game events
    GameInformation = 'gameInformation',
    Cards = 'cards',
    NewCard = 'newCard',
    NewReturnedCard = 'newReturnedCard',
    NewTurn = 'newTurn',

    // results events
    ResultsInformation = 'resultsInformation',
    WinnerName = 'winnerName',
    WinnerCards = 'winnerCards',
}

export enum SendEvents {
    StartGame = 'startGame',
    GetStateInfo = 'getStateInfo',
    GetCards = 'getCards',
    DrawDeck = 'drawDeck',
    DrawDump = 'drawDump',
    DumpCard = 'dumpCard',
    QuitGame = 'quitGame',
    ThirtyOne = 'thirtyOne',
}

export enum GameState {
    Waiting = 'waiting',
    Game = 'game',
    Results = 'results',
}
