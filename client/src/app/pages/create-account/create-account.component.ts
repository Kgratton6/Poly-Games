import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IconListComponent } from '@app/components/icon-list/icon-list.component';
import { DEFAULT_ICON } from '@app/consts/profile.const';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { NotificationService } from '@app/services/notification.service';
import { faEye, faEyeSlash, faPen } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-create-account',
    templateUrl: './create-account.component.html',
    styleUrls: ['./create-account.component.scss'],
})
export class CreateAccountComponent {
    faEye = faEye;
    faEyeSlash = faEyeSlash;
    penIcon = faPen;
    isPasswordVisible1 = false;
    isPasswordVisible2 = false;
    chosenIcon = DEFAULT_ICON;

    createForm = new FormGroup(
        {
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required),
            username: new FormControl('', [Validators.required, this.noWhitespaceValidator]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', Validators.required),
            passwordVerification: new FormControl('', Validators.required),
        },
        { validators: this.passwordMatchValidator },
    );

    // eslint-disable-next-line max-params
    constructor(
        private communicationService: CommunicationService,
        private authService: AuthService,
        private notification: NotificationService,
        private router: Router,
        private readonly dialog: MatDialog,
    ) {}

    onSubmit(): void {
        if (this.createForm.valid) {
            // eslint-disable-next-line no-unused-vars
            const user = this.createForm.value;
            this.communicationService
                .createAccount(
                    {
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        username: user.username || '',
                        email: user.email || '',
                        isOnline: false,
                        icon: this.chosenIcon || '',
                    },
                    user.password || '',
                )
                .subscribe({
                    next: () => {
                        this.notification.notify('Account succesfully created');
                        this.authService.login(user.username || '', user.password || '').subscribe({
                            next: () => {
                                this.router.navigate(['/home']);
                            },
                        });
                    },
                    error: (error) => {
                        this.notification.notify('Account creation failed : this username ' + error.message);
                    },
                });
        } else {
            window.alert('Form is not valid');
        }
    }

    async openIcons() {
        const dialogRef: MatDialogRef<IconListComponent> = this.dialog.open(IconListComponent, { panelClass: 'custom-dialog-container' });
        const enteredIcon = await lastValueFrom(dialogRef.afterClosed());
        if (enteredIcon) {
            this.chosenIcon = enteredIcon;
        }
    }

    private noWhitespaceValidator(control: FormControl): ValidationErrors | null {
        const haveWhispace = (control.value || '').trim().length === 0;
        return !haveWhispace ? null : { whitespace: true };
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const passwordVerification = control.get('passwordVerification')?.value;
        return password === passwordVerification ? null : { passwordMismatch: true };
    }
}
