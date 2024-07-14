import { Injectable } from '@angular/core';
import { ANIMATION_DELAY, MAX_N_PLAYERS, MY_PLAYER_POSITION } from '@app/consts/game.const';
import { Card } from '@app/interfaces/card';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';

@Injectable({
    providedIn: 'root',
})
export class GameVisualsService {
    movementNeeded = 0;

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
        setTimeout(() => {
            const cardElements = document.querySelectorAll('.card');
            const newCardElement = cardElements[cardElements.length - 1];
            newCardElement.classList.add('new-card');
            setTimeout(() => {
                newCardElement.classList.remove('new-card');
            }, ANIMATION_DELAY);
        }, 0);
    }

    dumpCardAnimation() {
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

    drawDumpAnimation(dump: Card[], turn: number) {
        const animationOffset = -(this.movementNeeded - MY_PLAYER_POSITION + turn);
        if (animationOffset !== 0) {
            setTimeout(() => {
                const returnedCardElement = document.querySelector('.center-image.dump-stack-card.current-returned');
                if (returnedCardElement) {
                    returnedCardElement.classList.add('drawing-dump');
                    setTimeout(() => {
                        returnedCardElement.classList.remove('drawing-dump');
                        dump.pop();
                    }, ANIMATION_DELAY);
                }
            }, 0);
        } else {
            dump.pop();
        }
    }
}
