export enum ReceveEvents {
    ConnectionConfirmation = 'connectionConfirmation',
    GameInformation = 'gameInformation',
    NewTurn = 'newTurn',
    NewPlayer = 'newPlayer',
    Error = 'error',

    // card events
    Cards = 'cards',
    NewCard = 'newCard',
    NewReturnedCard = 'newReturnedCard',
}

export enum SendEvents {
    Play = 'play',
    GetCards = 'getCards',
    DrawDeck = 'drawDeck',
    DrawDump = 'drawDump',
    DumpCard = 'dumpCard',
    BroadcastMessage = 'broadcastMessage',
    BroadcastMessageExept = 'broadcastMessageExept',
}
