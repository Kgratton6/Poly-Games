import { Injectable } from '@angular/core';
import { ANIMATION_DELAY, MAX_N_PLAYERS, MY_PLAYER_POSITION } from '@app/consts/game.const';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { SoundService } from './sound.service';

@Injectable({
    providedIn: 'root',
})
export class GameVisualsService {
    movementNeeded = 0;

    constructor(private DJ: SoundService) {}

    updateSlots(players: Player31[], yourPlayer: User): { player: Player31 | null; isHost: boolean }[] {
        const tempArray: { player: Player31 | null; isHost: boolean }[] = Array.from({ length: MAX_N_PLAYERS }, (_, i) => ({
            player: players[i] || null,
            isHost: i === 0 && players[0]?.username === yourPlayer.username,
        }));

        const yourPlayerIndex = tempArray.findIndex((slot) => slot.player?.username === yourPlayer.username);
        this.movementNeeded = MY_PLAYER_POSITION - (yourPlayerIndex % MAX_N_PLAYERS);

        const slots: { player: Player31 | null; isHost: boolean }[] = [];
        for (let i = 0; i < tempArray.length; i++) {
            const newIndex = (i + this.movementNeeded) % tempArray.length;
            slots[newIndex] = tempArray[i];
        }
        [slots[0], slots[2]] = [slots[2], slots[0]];
        return slots;
    }

    getPlayerMovement() {
        return this.movementNeeded;
    }

    drawCardAnimation() {
        this.DJ.playSound('drawCard');
        setTimeout(() => {
            const cardElements = document.querySelectorAll('.card');
            const newCardElement = cardElements[cardElements.length - 1];
            newCardElement.classList.add('new-card');
            setTimeout(() => {
                newCardElement.classList.remove('new-card');
            }, ANIMATION_DELAY);
        }, 0);
    }

    drawDeckAnimation() {
        this.DJ.playSound('drawCard');
        setTimeout(() => {
            const deckCard = document.querySelector('.center-image.dump-stack-card.over-deck');
            if (deckCard) {
                deckCard.classList.add('drawing-deck');
                setTimeout(() => {
                    deckCard.classList.remove('drawing-deck');
                }, ANIMATION_DELAY);
            }
        }, 0);
    }

    dumpCardAnimation() {
        this.DJ.playSound('dropCard');
        setTimeout(() => {
            const returnedCardElement = document.querySelector('.center-image.dump-stack-card.current-returned');
            if (returnedCardElement) {
                returnedCardElement.classList.add('dumping-card');
                setTimeout(() => {
                    returnedCardElement.classList.remove('dumping-card');
                }, ANIMATION_DELAY);
            }
        }, 0);
    }

    async drawDumpAnimation(): Promise<void> {
        this.DJ.playSound('drawCard');
        return new Promise((resolve) => {
            setTimeout(() => {
                const returnedCardElement = document.querySelector('.center-image.dump-stack-card.current-returned');
                if (returnedCardElement) {
                    returnedCardElement.classList.add('drawing-dump');
                    setTimeout(() => {
                        returnedCardElement.classList.remove('drawing-dump');
                        resolve();
                    }, ANIMATION_DELAY);
                } else {
                    resolve();
                }
            }, 0);
        });
    }
}
