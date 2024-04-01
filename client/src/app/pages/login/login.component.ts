import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@app/services/notification.service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    faEye = faEye;
    faEyeSlash = faEyeSlash;
    isPasswordVisible = false;

    loginForm = new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
    });
    constructor(
        private authService: AuthService,
        private router: Router,
        private notification: NotificationService,
    ) {}

    ngOnInit(): void {
        this.authService.isLoggedIn().subscribe((reponse: boolean) => {
            if (reponse) {
                this.router.navigate(['/home']);
            }
        });
    }

    onSubmit(): void {
        const username = this.loginForm.value.username;
        const password = this.loginForm.value.password;
        if (this.loginForm.valid && username && password) {
            this.authService.login(username, password).subscribe({
                next: () => {
                    console.log('je suis dans login succesfull');
                    this.notification.notify('Login successful');
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    console.log('je suis dans login error');
                    this.notification.notify(error);
                },
            });
        } else {
            this.notification.notify('Enter username and password in a valid format');
        }
    }
}
