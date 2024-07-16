import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from './components/header/header.component';
import { IconListComponent } from './components/icon-list/icon-list.component';
import { MainAreaComponent } from './components/main-area/main-area.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SocialAreaComponent } from './components/social-area/social-area.component';
import { TablesListComponent } from './components/tables-list/tables-list.component';
import { ThirtyOneGameComponent } from './components/thirty-one/thirty-one-game/thirty-one-game.component';
import { ThirtyOneResultsComponent } from './components/thirty-one/thirty-one-results/thirty-one-results.component';
import { ThirtyOneWaitingComponent } from './components/thirty-one/thirty-one-waiting/thirty-one-waiting.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserComponent } from './components/user/user.component';
import { AccountComponent } from './pages/account/account.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { HomeComponent } from './pages/home/home.component';
import { LiveGameComponent } from './pages/live-game/live-game.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ThirtyOneComponent } from './pages/thirty-one/thirty-one.component';
import { ChatComponent } from './components/chat/chat.component';
import { ThirtyOneRulesComponent } from './components/thirty-one/thirty-one-rules/thirty-one-rules.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        NotFoundComponent,
        LoginComponent,
        HeaderComponent,
        HomeComponent,
        UserComponent,
        UserListComponent,
        SocialAreaComponent,
        MainAreaComponent,
        ProfileComponent,
        SearchBarComponent,
        CreateAccountComponent,
        IconListComponent,
        AccountComponent,
        LiveGameComponent,
        ThirtyOneWaitingComponent,
        ThirtyOneGameComponent,
        ThirtyOneResultsComponent,
        ThirtyOneComponent,
        TablesListComponent,
        ChatComponent,
        ThirtyOneRulesComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        MatTabsModule,
        MatButtonModule,
        MatMenuModule,
        MatSlideToggleModule,
        HttpClientModule,
        MatSnackBarModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
