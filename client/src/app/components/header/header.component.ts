import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_ICON } from '@app/consts/profile.const';
import { AuthService } from '@app/services/auth.service';
import { ProfileService } from '@app/services/profile.service';
import { faBell, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
    bell = faBell;
    settings = faCog;
    signOut = faSignOutAlt;
    isLightTheme: boolean = false;
    profileIcon = DEFAULT_ICON;

    constructor(
        private router: Router,
        private auth: AuthService,
        private profileService: ProfileService,
    ) {}

    ngOnInit(): void {
        this.isLightTheme = localStorage.getItem('theme') === 'light'; // Get theme from local storage
        this.setTheme();

        this.profileService.fetchProfile().subscribe({
            next: (profile) => {
                this.profileIcon = profile.icon;
            },
            error: () => {
                this.profileIcon = DEFAULT_ICON;
            },
        });
    }

    logout(): void {
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    toggleTheme(): void {
        this.isLightTheme = !this.isLightTheme;
        this.setTheme();
        localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark'); // Set theme to local storage
    }

    private setTheme(): void {
        if (this.isLightTheme) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
}
