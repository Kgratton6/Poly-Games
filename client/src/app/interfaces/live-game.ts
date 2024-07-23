export enum GameType {
    ThirtyOne = 'thirtyOne',
    Uno = 'uno',
}

export interface LiveGame {
    tableId: string;
    gameType: string;
}
