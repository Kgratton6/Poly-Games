/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CARD_COLORS, CARD_VALUES } from '@app/consts/game.const';
import { BJCard } from '@app/interfaces/card';
import { BehaviorSubject } from 'rxjs';
import { GameVisualsService } from './game-visuals.service';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class BlackJackService {
    isBankrupt = false;
    cards: BJCard[] = [];
    split1: BJCard[] = [];
    isSplit = false;
    splitTurn = false; // false = cards, true = split1
    isGameFinished = false;
    resultsMessage = '';
    resultsMessageSplit = '';
    dealerCards: BJCard[] = [];
    deck: BJCard[] = [];
    money: number = 0;
    bet: number = 50;

    cardsSubject: BehaviorSubject<BJCard[]> = new BehaviorSubject<BJCard[]>([]);
    split1Subject: BehaviorSubject<BJCard[]> = new BehaviorSubject<BJCard[]>([]);
    dealerCardsSubject: BehaviorSubject<BJCard[]> = new BehaviorSubject<BJCard[]>([]);
    isGameFinishedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    resultsMessageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    resultsSplitSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    moneySubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    betSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    splitTurnSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private router: Router,
        private gameVisuals: GameVisualsService,
        protected notification: NotificationService,
    ) {}

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    initializeDeck() {
        this.deck = [];
        for (let i = 0; i < 3; i++) {
            for (const color of CARD_COLORS) {
                for (const value of CARD_VALUES) {
                    this.deck.push({ value, color, isReturned: false });
                }
            }
        }
        this.shuffleDeck();
    }

    clearTable() {
        this.cards = [];
        this.split1 = [];
        this.dealerCards = [];
        this.isSplit = false;
        this.splitTurn = false;
        this.splitTurnSubject.next(this.splitTurn);
        this.isGameFinished = false;
        this.isGameFinishedSubject.next(this.isGameFinished);
        this.newMessage('');
        this.newMessageSplit('');
        this.cardsSubject.next(this.cards);
        this.dealerCardsSubject.next(this.dealerCards);
        this.split1Subject.next(this.split1);
        this.bet = 0;
        this.betSubject.next(this.bet);
    }

    createTable() {
        this.router.navigate(['live-game/black-jack', '0']);
    }

    async getTableInfo() {
        const savedData = localStorage.getItem('blackJackGameData');

        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.cards = gameData.cards;
            this.split1 = gameData.split1;
            this.isSplit = gameData.isSplit;
            this.splitTurn = gameData.splitTurn;
            this.isGameFinished = gameData.isGameFinished;
            this.resultsMessage = gameData.resultsMessage;
            this.resultsMessageSplit = gameData.resultsMessageSplit;
            this.dealerCards = gameData.dealerCards;
            this.deck = gameData.deck;
            this.money = gameData.money;
            this.bet = gameData.bet;

            this.cardsSubject.next(this.cards);
            this.split1Subject.next(this.split1);
            this.isGameFinishedSubject.next(this.isGameFinished);
            this.resultsMessageSubject.next(this.resultsMessage);
            this.resultsSplitSubject.next(this.resultsMessageSplit);
            this.dealerCardsSubject.next(this.dealerCards);
            this.moneySubject.next(this.money);
            this.splitTurnSubject.next(this.splitTurn);
            this.betSubject.next(this.bet);
        } else {
            this.isBankrupt = false;
            this.initializeDeck();
            this.newMoney(1000);
            this.clearTable();
        }
    }

    saveInfoStorage() {
        const gameData = {
            cards: this.cards,
            split1: this.split1,
            isSplit: this.isSplit,
            splitTurn: this.splitTurn,
            isGameFinished: this.isGameFinished,
            resultsMessage: this.resultsMessage,
            resultsMessageSplit: this.resultsMessageSplit,
            dealerCards: this.dealerCards,
            deck: this.deck,
            money: this.money,
            bet: this.bet,
        };
        localStorage.setItem('blackJackGameData', JSON.stringify(gameData));
        localStorage.setItem('test', 'hello');
    }

    deleteTable() {
        localStorage.removeItem('blackJackGameData');
        this.router.navigate(['/home']);
    }

    drawDeck(isReturned: boolean) {
        if (this.deck.length === 1) this.initializeDeck();
        const card = this.deck.pop() as BJCard;
        card.isReturned = isReturned;
        return card;
    }

    async drawCard(isReturned: boolean) {
        const card = this.drawDeck(isReturned);
        if (!this.splitTurn) {
            this.cards.push(card);
            this.cardsSubject.next(this.cards);
            await this.gameVisuals.drawCardAnimationBJ();
        } else {
            this.split1.push(card);
            this.split1Subject.next(this.split1);
            await this.gameVisuals.drawCardAnimationBJSplit1();
        }
    }

    async drawDealer(isReturned: boolean) {
        const card = this.drawDeck(isReturned);
        this.dealerCards.push(card);
        this.dealerCardsSubject.next(this.dealerCards);
        await this.gameVisuals.drawDealerAnimation();
    }

    async distribute() {
        await this.drawCard(true);
        await this.drawDealer(true);

        await this.drawCard(true);
        await this.drawDealer(false);

        if (this.calculateTotal(this.cards) === 21) await this.stand();
    }

    calculateTotal(cards: BJCard[]): number {
        let total = 0;
        let aces = 0;
        for (const card of cards) {
            if (card.isReturned === true) {
                if (card.value === 1) {
                    aces += 1;
                    total += 11;
                } else if ([11, 12, 13].includes(card.value)) {
                    total += 10;
                } else {
                    total += card.value;
                }
            }
        }
        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }
        return total;
    }

    async betMoney(betAmount: number) {
        this.clearTable();
        this.newBet(betAmount);
        this.newMoney(this.money - this.bet);
        await this.distribute();
    }

    async hit() {
        await this.drawCard(true);

        if (!this.splitTurn) {
            const cardsTotal = this.calculateTotal(this.cards);
            if (cardsTotal > 21) await this.stand();
        } else {
            const cardsTotal = this.calculateTotal(this.split1);
            if (cardsTotal > 21) await this.stand();
        }
    }

    async stand() {
        if (this.isSplit === true && !this.splitTurn) {
            this.splitTurn = true;
            this.splitTurnSubject.next(this.splitTurn);
        } else {
            let dealerTotal = this.calculateTotal(this.dealerCards);
            if (this.calculateTotal(this.cards) <= 21 || (this.split1.length !== 0 && this.calculateTotal(this.split1) < 21)) {
                this.dealerCards[1].isReturned = true;
                while (dealerTotal < 17) {
                    await this.drawDealer(true);
                    dealerTotal = this.calculateTotal(this.dealerCards);
                }
            }

            const hands = [this.cards, this.split1];
            const messageFunctions = [this.newMessage.bind(this), this.newMessageSplit.bind(this)];

            for (let i = 0; i < hands.length; i++) {
                const hand = hands[i];
                const messageFunction = messageFunctions[i];

                if (hand.length > 0) {
                    const playerTotal = this.calculateTotal(hand);

                    if (playerTotal > 21) {
                        messageFunction('You busted!');
                    } else if (playerTotal === 21 && this.cards.length === 2) {
                        if (dealerTotal === 21 && this.dealerCards.length === 2) {
                            messageFunction('Its a push');
                            this.newMoney(this.money + this.bet);
                        } else {
                            messageFunction('BlackJack!');
                            this.newMoney(this.money + this.bet * 2.5);
                        }
                    } else {
                        if (playerTotal === dealerTotal) {
                            messageFunction('Its a push');
                            this.newMoney(this.money + this.bet);
                        } else if (dealerTotal > 21) {
                            messageFunction('Dealer busted');
                            this.newMoney(this.money + this.bet * 2);
                        } else if (playerTotal > dealerTotal) {
                            messageFunction('You win');
                            this.newMoney(this.money + this.bet * 2);
                        } else if (playerTotal < dealerTotal) {
                            messageFunction('Dealer wins');
                        }
                    }
                }
            }
            this.newBet(0);
            this.isGameFinished = true;
            this.isGameFinishedSubject.next(this.isGameFinished);
            if (this.money === 0 && !this.isBankrupt) {
                this.notification.notify("We don't want broke people in this casino...");
                this.notification.notify('You can now leave or play for fun.');
                this.isBankrupt = true;
            }
        }
    }

    async doubleDown() {
        const playerTotal = this.calculateTotal(this.cards);
        if ((playerTotal === 9 || playerTotal === 10 || playerTotal === 11) && this.cards.length === 2) {
            this.newMoney(this.money - this.bet);
            this.newBet(this.bet * 2);
            await this.hit();
            await this.stand();
        }
    }

    split() {
        if (this.money < this.bet) {
            this.notification.notify("You don't have enough money to split.");
        } else if (this.cards.length === 2 && this.split1.length === 0 && this.cards[0].value === this.cards[1].value) {
            this.split1.push(this.cards.pop() as BJCard);
            this.cardsSubject.next(this.cards);
            this.split1Subject.next(this.split1);
            this.isSplit = true;
            this.newMoney(this.money - this.bet);
        }
    }

    newMessage(message: string) {
        this.resultsMessage = message;
        this.resultsMessageSubject.next(this.resultsMessage);
    }

    newMessageSplit(message: string) {
        this.resultsMessageSplit = message;
        this.resultsSplitSubject.next(this.resultsMessageSplit);
    }

    newMoney(amount: number) {
        if (this.isBankrupt) {
            return;
        }
        this.money = amount;
        this.moneySubject.next(this.money);
    }

    newBet(amount: number) {
        this.bet = amount;
        this.betSubject.next(this.bet);
    }
}
