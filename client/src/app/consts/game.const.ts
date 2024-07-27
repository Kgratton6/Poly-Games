import { Card } from '@app/interfaces/card';

export const DEFAULT_PAGE = 'games';
export const NO_CARD: Card = {
    color: 'null',
    value: 0,
};
export const NO_HOST = -1;
export const GAME_TOKEN = 'game-token';
export const MAX_N_PLAYERS = 6;
export const MY_PLAYER_POSITION = 4;
export const ANIMATION_DELAY = 1000;
export const SKIP_TURN = 10;
export const DRAW_2 = 11;
export const CHANGE_COLOR = 13;
export const DRAW_4 = 14;
export const CARD_COLORS: string[] = ['Hearts', 'Diamond', 'Spades', 'Clubs'];
export const CARD_VALUES: number[] = Array.from({ length: 13 }, (_, i) => i + 1);
