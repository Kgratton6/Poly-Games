/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BlackJackRulesComponent } from '@app/components/black-jack/black-jack-rules/black-jack-rules.component';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { BJCard } from '@app/interfaces/card';
import { User } from '@app/interfaces/user';
import { BlackJackService } from '@app/services/black-jack.service';
import { NotificationService } from '@app/services/notification.service';
import { TokenService } from '@app/services/token.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-black-jack-game',
    templateUrl: './black-jack-game.component.html',
    styleUrls: ['./black-jack-game.component.scss'],
})
export class BlackJackGameComponent implements OnInit, OnDestroy {
    @Input() yourPlayer: User = DEFAULT_USER;
    cards: BJCard[] = [];
    dealerCards: BJCard[] = [];
    split1: BJCard[] = [];
    questionIcon = faQuestionCircle;
    gameStateMessage: string = '';
    gameStateSplit: string = '';
    isGameFinished: boolean = false;
    splitTurn: boolean = false; // false = cards, true = split1
    totalMoney: number = 1000;
    bet: number = 0;
    private isQuittingGame = false;

    constructor(
        protected notification: NotificationService,
        protected token: TokenService,
        private readonly dialog: MatDialog,
        private blackJack: BlackJackService,
    ) {}

    async ngOnInit() {
        this.notification.notify('Welcome to the table.');
        this.blackJack.cardsSubject.subscribe((cards) => (this.cards = cards));
        this.blackJack.split1Subject.subscribe((split1Cards) => (this.split1 = split1Cards));
        this.blackJack.dealerCardsSubject.subscribe((dealerCards) => (this.dealerCards = dealerCards));
        this.blackJack.isGameFinishedSubject.subscribe((gameFinished) => (this.isGameFinished = gameFinished));
        this.blackJack.resultsMessageSubject.subscribe((message) => (this.gameStateMessage = message));
        this.blackJack.resultsSplitSubject.subscribe((message) => (this.gameStateSplit = message));
        this.blackJack.moneySubject.subscribe((money) => (this.totalMoney = money));
        this.blackJack.splitTurnSubject.subscribe((turn) => (this.splitTurn = turn));
        this.blackJack.betSubject.subscribe((money) => (this.bet = money));
        await this.blackJack.getTableInfo();
        this.bet = this.blackJack.bet;
    }

    ngOnDestroy(): void {
        if (!this.isQuittingGame) {
            this.blackJack.saveInfoStorage();
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @HostListener('window:beforeunload', ['$event'])
    handleBeforeUnload() {
        this.blackJack.saveInfoStorage();
    }

    quitGame() {
        this.isQuittingGame = true;
        this.token.deleteGameToken();
        this.blackJack.deleteTable();
    }

    async playAgain() {
        await this.blackJack.clearTable();
    }

    async onStand() {
        await this.blackJack.stand();
    }

    async onHit() {
        await this.blackJack.hit();
    }

    async onSplit() {
        await this.blackJack.split();
    }

    async onDoubleDown() {
        await this.blackJack.doubleDown();
    }

    async onBet(amount: number) {
        this.bet = amount;
        await this.blackJack.betMoney(amount);
    }

    calculateDoubleDown() {
        const total = this.blackJack.calculateTotal(this.cards);
        return (total === 9 || total === 10 || total === 11) && this.cards.length === 2;
    }

    calculateTotal(cards: BJCard[]) {
        return this.blackJack.calculateTotal(cards);
    }

    async blackJackRules() {
        const dialogRef: MatDialogRef<BlackJackRulesComponent> = this.dialog.open(BlackJackRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
