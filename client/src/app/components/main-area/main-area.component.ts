import { Component } from '@angular/core';
import { DEFAULT_PAGE } from '@app/consts/game.const';

@Component({
    selector: 'app-main-area',
    templateUrl: './main-area.component.html',
    styleUrls: ['./main-area.component.scss'],
})
export class MainAreaComponent {
    selectedComponent: string = DEFAULT_PAGE;
}
