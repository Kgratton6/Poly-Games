import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/interfaces/user';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
    observe: 'response' as const,
    responseType: 'text' as 'json',
};

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    login(username: string, password: string): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/login_user`, { username, password }, httpOptions).pipe(catchError(this.handleError));
    }

    logout(token: string): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/logout_user`, { token }, httpOptions).pipe(catchError(this.handleError));
    }

    isLoggedIn(token: string): Observable<HttpResponse<string>> {
        return this.http.post<HttpResponse<string>>(`${this.baseUrl}/user/is_logged_in`, { token }).pipe(catchError(this.handleError));
    }

    createAccount(user: User, password: string): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/create_user`, { user, password }, httpOptions).pipe(catchError(this.handleError));
    }

    getProfile(token: string): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${this.baseUrl}/user/profile`, { token }, httpOptions).pipe(catchError(this.handleError));
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/user/fetch_users`).pipe(catchError(this.handleError));
    }

    getUser(username: string): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/user/fetch_user/${username}`).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.Unauthorized) {
            return throwError(() => new Error('wrong password or email'));
        } else if (error.status === HttpStatusCode.Conflict) {
            return throwError(() => new Error('already exists'));
        }
        return throwError(() => new Error('Error Communicating with the server'));
    }
}
