import { Component } from '@angular/core';

interface Card {
    id: number;
    imgFront: string;
    imgBack: string;
    isFlipped: boolean;
    isInTransition: boolean;
}

@Component({
    selector: 'app-test-page',
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.scss'],
})
export class TestPageComponent {
    cardsList1: Card[] = [];
    cardsList2: Card[] = [];

    constructor() {
        // Initialize cards (just an example)
        this.cardsList1 = Array.from({ length: 2 }, (_, i) => ({
            id: i + 1,
            imgFront: './assets/img/cards/Spades 1.png',
            imgBack: './assets/img/cards/returned-blue.png',
            isFlipped: false,
            isInTransition: false,
        }));
    }
    flipCard(event: Event) {
        const cardElement = (event.currentTarget as HTMLElement).closest('.card');
        if (cardElement) {
            cardElement.classList.toggle('is-flipped');
        }
    }
    // moveCard() {
    //     const cardElement = document.querySelector('.card-container:nth-child(1)') as HTMLElement;
    //     const allCards = document.querySelectorAll('.card-container');
    //     const targetContainer = allCards[4] as HTMLElement;

    //     if (cardElement && targetContainer) {
    //         cardElement.style.transition = 'transform 2s';
    //         cardElement.style.transform = 'translate(calc(336px), calc(416px))';
    //         setTimeout(() => {
    //             const parent = targetContainer.parentNode as HTMLElement;
    //             parent.insertBefore(cardElement, targetContainer.nextSibling);
    //             cardElement.style.transition = '';
    //             cardElement.style.transform = '';
    //         }, 2000);
    //     }
    // }

    moveCard(card: Card, fromList: Card[], toList: Card[]) {
        const index = fromList.findIndex((c) => c.id === card.id);
        if (index !== -1) {
            card.isInTransition = true; // Set transition flag
            setTimeout(() => {
                const movedCard = fromList.splice(index, 1)[0];
                movedCard.isFlipped = false; // Reset flipped state
                card.isInTransition = false; // Reset transition flag after animation
                toList.push(movedCard);
            }, 600); // Duration of the transition in milliseconds (0.6s)
        }
    }

    toggleCardFlip(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('dismiss')) {
            target.classList.remove('dismiss');
        }

        if (target.classList.contains('show')) {
            target.classList.remove('show');
            target.classList.add('dismiss');
        } else {
            target.classList.add('show');
        }
    }
}
