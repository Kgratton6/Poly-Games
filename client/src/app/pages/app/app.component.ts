import { Component } from '@angular/core';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private themeService: ThemeService) {}

    onInit(): void {
        this.themeService.detectTheme();
    }
}
