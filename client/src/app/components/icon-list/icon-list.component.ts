import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

const ICON_LIST = [
    '8ball',
    'cash-machine',
    'cherry',
    'chip',
    'chips',
    'colored-weel',
    'dealer',
    'dice',
    'dices',
    'dimond',
    'dollar',
    'heart',
    'poker-chip',
    'roulette',
    'spade',
    'yellow-chip',
];

@Component({
    selector: 'app-icon-list',
    templateUrl: './icon-list.component.html',
    styleUrls: ['./icon-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class IconListComponent {
    iconList = ICON_LIST;
    password: string = '';
    hide = true;

    constructor(public dialogRef: MatDialogRef<IconListComponent>) {}
}
