import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-thirty-one-rules',
    templateUrl: './thirty-one-rules.component.html',
    styleUrls: ['./thirty-one-rules.component.scss'],
})
export class ThirtyOneRulesComponent {
    constructor(public dialogRef: MatDialogRef<ThirtyOneRulesComponent>) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}
