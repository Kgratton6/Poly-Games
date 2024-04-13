import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';
import { AccountComponent } from '@app/pages/account/account.component';
import { CreateAccountComponent } from '@app/pages/create-account/create-account.component';
import { ForgotPasswordComponent } from '@app/pages/forgot-password/forgot-password.component';
import { HomeComponent } from '@app/pages/home/home.component';
import { LiveGameComponent } from '@app/pages/live-game/live-game.component';
import { LoginComponent } from '@app/pages/login/login.component';
import { NotFoundComponent } from '@app/pages/not-found/not-found.component';
import { ThirtyOneComponent } from '@app/pages/thirty-one/thirty-one.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'create-account', component: CreateAccountComponent },
    {
        path: '',
        canActivate: [AuthGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'live-game', component: LiveGameComponent },
            { path: 'user/:username', component: AccountComponent },
            { path: 'thirty-one/:tableId', component: ThirtyOneComponent },
        ],
    },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
