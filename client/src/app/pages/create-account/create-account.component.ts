import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IconListComponent } from '@app/components/icon-list/icon-list.component';
import { DEFAULT_ICON } from '@app/consts/profile.const';
import { NewUserService } from '@app/services/new-user.service';
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
        private userService: NewUserService,
        private notification: NotificationService,
        private router: Router,
        private readonly dialog: MatDialog,
    ) {}

    onSubmit(): void {
        if (this.createForm.valid) {
            const correctUser = this.userService.getUserFromForm(this.createForm, this.chosenIcon);
            this.userService.createUser(correctUser, this.createForm.value.password || '').subscribe({
                next: () => {
                    this.notification.notify('Account succesfully created');
                    this.router.navigate(['/login']);
                },
                error: (error) => {
                    this.notification.notify(error);
                },
            });
        } else {
            if (this.createForm.controls['username'].errors?.['whitespace']) {
                this.notification.notify('The username cannot contain spaces.');
            } else if (this.createForm.controls['email'].errors) {
                this.notification.notify('Please enter a valid email address.');
            } else if (this.createForm.errors?.['passwordMismatch']) {
                this.notification.notify('The passwords do not match.');
            } else {
                this.notification.notify('Please make sure all fields are filled out correctly.');
            }
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
        const isWhitespace = /\s/.test(control.value || '');
        return !isWhitespace ? null : { whitespace: true };
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const passwordVerification = control.get('passwordVerification')?.value;
        return password === passwordVerification ? null : { passwordMismatch: true };
    }
}
