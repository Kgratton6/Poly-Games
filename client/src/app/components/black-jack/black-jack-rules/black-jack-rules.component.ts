import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-black-jack-rules',
    templateUrl: './black-jack-rules.component.html',
    styleUrls: ['./black-jack-rules.component.scss'],
})
export class BlackJackRulesComponent {
    constructor(public dialogRef: MatDialogRef<BlackJackRulesComponent>) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}
