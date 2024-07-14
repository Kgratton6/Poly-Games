import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_ICON } from '@app/consts/profile.const';
import { AuthService } from '@app/services/auth.service';
import { UsersDataService } from '@app/services/users-data.service';
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
    profileName = '';

    constructor(
        private router: Router,
        private auth: AuthService,
        private userDataService: UsersDataService,
    ) {}

    ngOnInit(): void {
        this.isLightTheme = localStorage.getItem('theme') === 'light';
        this.setTheme();

        this.userDataService.getProfile().subscribe({
            next: (profile) => {
                this.profileIcon = profile.icon;
                this.profileName = profile.username;
            },
            error: () => {
                this.profileIcon = DEFAULT_ICON;
                this.profileName = '';
            },
        });
    }

    logout(): void {
        this.auth.logout().subscribe(() => {
            this.userDataService.clearData();
            this.router.navigate(['/login']);
        });
    }

    toggleTheme(): void {
        this.isLightTheme = !this.isLightTheme;
        this.setTheme();
        localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark');
    }

    private setTheme(): void {
        if (this.isLightTheme) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
}
