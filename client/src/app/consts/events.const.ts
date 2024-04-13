export enum ReceveEvents {
    // general events
    ConnectionConfirmation = 'connectionConfirmation',
    Error = 'error',
    NewGameState = 'gameState',
    QuickedOut = 'quickedOut',

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
}

export enum SendEvents {
    StartGame = 'startGame',
    GetStateInfo = 'getStateInfo',
    Play = 'play',
    GetCards = 'getCards',
    DrawDeck = 'drawDeck',
    DrawDump = 'drawDump',
    DumpCard = 'dumpCard',

    // temporaire
    FinishGame = 'finishGame',
}

export enum GameState {
    Waiting = 'waiting',
    Game = 'game',
    Results = 'results',
}
