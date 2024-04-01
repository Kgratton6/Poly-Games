import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ICON_LIST } from '@app/consts/profile.const';

@Component({
    selector: 'app-icon-list',
    templateUrl: './icon-list.component.html',
    styleUrls: ['./icon-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class IconListComponent {
    iconList = ICON_LIST;

    constructor(public dialogRef: MatDialogRef<IconListComponent>) {}
}
