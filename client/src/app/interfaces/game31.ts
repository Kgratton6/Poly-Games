/* eslint-disable prettier/prettier */
import { Player31, PlayerUno } from './player';

export interface Table31 {
    tableId: string;
    players: Player31[];
    turn: number;
}

export interface TableUno {
    tableId: string;
    players: PlayerUno[];
    turn: number;
}
