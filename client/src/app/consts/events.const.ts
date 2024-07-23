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
    Dump = 'dump',
    NewCard = 'newCard',
    NewTurn = 'newTurn',
    // à changer
    DrawDeck = 'drawDeck',
    DrawDump = 'drawDump',
    DumpCard = 'dumpCard',
    NewReturnedCard = 'newReturnedCard',

    LastTurn = 'lastTurn',

    // results events
    ResultsInformation = 'resultsInformation',
    WinnerName = 'winnerName',
    WinnerCards = 'winnerCards',

    // other events
    NewChat = 'newChat',

    Uno = 'uno',
    Winners = 'winners',
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
    FinishGame = 'finishGame',
    SendChat = 'sendChat',

    // Uno only events
    DrawCard = 'drawCard',
    DontDump = 'dontDump',

    SkipTurn = 'skipTurn',
    Draw2 = 'draw2',
    ChangeTurn = 'changeTurn',
    Draw4 = 'draw4',
    ChangeColor = 'changeColor',
}

export enum GameState {
    Waiting = 'waiting',
    Game = 'game',
    Results = 'results',
}
