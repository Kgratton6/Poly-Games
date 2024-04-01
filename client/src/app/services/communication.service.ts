import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/interfaces/user';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(
        private readonly http: HttpClient,
        private readonly tokenService: TokenService,
    ) {}

    // user token needed methods
    login(username: string, password: string): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/login_user`, { username, password }, this.getHeaders()).pipe(
            map((response: HttpResponse<string>) => {
                const body = JSON.parse(response.body as string);
                this.tokenService.setUserToken(body.token);
                return response;
            }),
            catchError(this.handleError),
        );
    }

    logout(): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/logout_user`, {}, this.getHeadersToken()).pipe(
            map((response: HttpResponse<string>) => {
                this.tokenService.deleteUserToken();
                return response;
            }),
            catchError(this.handleError),
        );
    }

    isLoggedIn(): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/is_logged_in`, {}, this.getHeadersToken()).pipe(catchError(this.handleError));
    }

    getProfile(): Observable<HttpResponse<string>> {
        return this.http.get<string>(`${this.baseUrl}/user/profile`, this.getHeadersToken()).pipe(catchError(this.handleError));
    }

    createAccount(user: User, password: string): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/create_user`, { user, password }, this.getHeaders()).pipe(catchError(this.handleError));
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/user/fetch_users`).pipe(catchError(this.handleError));
    }

    getUser(username: string): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/user/fetch_user/${username}`).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => JSON.parse(error.error).error);
    }

    private getHeadersToken() {
        const headers = new HttpHeaders({
            token: this.tokenService.getUserToken(),
        });
        return {
            headers,
            observe: 'response' as const,
            responseType: 'text' as 'json',
        };
    }

    private getHeaders() {
        return {
            observe: 'response' as const,
            responseType: 'text' as 'json',
        };
    }
}
