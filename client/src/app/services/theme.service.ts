import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    constructor() {
        this.detectTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.detectTheme.bind(this));
    }

    detectTheme(): void {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            favicon.href = 'assets/favicon-light.ico';
        } else {
            favicon.href = 'assets/favicon-light.ico';
        }
    }
}
