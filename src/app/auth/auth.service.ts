import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';
import { environment } from '../../environments/environment'
import { MatSnackBar } from '@angular/material/snack-bar';

const BACKEND_URL = environment.apiUrl + 'user/';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private token: string;
    private authStatusListener = new Subject<boolean>();
    private emailStatusListener = new Subject<string>();
    private isAuthenticated = false;
    private tokenTimer: any;
    private userId: string;
    private userEmail: string;

    constructor(
        private HttpClient: HttpClient,
        private router: Router,
        private snackBar: MatSnackBar
    ) {

    }

    //
    getToken() {
        return this.token;
    }

    //
    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getUserEmail() {
        return this.userEmail;
    }

    //
    getAuthStatusListener() {
        // asObservable allows to emit value just form thies compomnent and the
        // next component can recive the data but can't emit it furtehr (next)
        return this.authStatusListener.asObservable();
    }

    getEmailStatusListener() {
        // asObservable allows to emit value just form thies compomnent and the
        // next component can recive the data but can't emit it furtehr (next)
        return this.emailStatusListener.asObservable();
    }

    //
    createUser(email: string, password: string) {

        const authData: AuthData = {
            email,
            password
        }

        return this.HttpClient.post<{ message: string, response: any }>(BACKEND_URL + 'signup', authData)
            .subscribe((res) => {
                this.snackBar.open(res.message, '',{
                    panelClass: ['my-snackbar'],
                    duration: 3000
                });
                this.router.navigate(['/']);
            }, (error) => {
                console.log(error);

                this.authStatusListener.next(false);
            });
    }

    //
    login(email: string, password: string) {

        const authData: AuthData = {
            email,
            password
        }

        this.HttpClient.post<{ token: string, expiresIn: number, userId: string, email: string }>(BACKEND_URL + 'login', authData)
            .subscribe((responce) => {
                // resiving jwt token               

                const token = responce.token;
                this.token = token;

                if (token) {
                    const expiresInDuration = responce.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.userId = responce.userId;
                    this.userEmail = responce.email;
                    this.authStatusListener.next(true);
                    this.emailStatusListener.next(responce.email);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token, expirationDate, this.userId, this.userEmail);
                    this.router.navigate(['/']);
                }
            }, (error) => {
                this.authStatusListener.next(false);
            });
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();

        if (!authInformation) {
            return;
        }
        // Checking if we are in the future

        const now = new Date();
        const expiresInMiliseconds = authInformation.expirationDate.getTime() - now.getTime();
        const expiresInseconds = expiresInMiliseconds / 1000;

        if (expiresInseconds > 0) {

            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.setAuthTimer(expiresInseconds);
            this.authStatusListener.next(true);
            this.userEmail = authInformation.email;
            this.emailStatusListener.next(authInformation.email);
        }
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
        this.emailStatusListener.next('');
    }

    private setAuthTimer(duration: number) {

        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string, email: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('email', email);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('expiration');
    }

    private getAuthData() {

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        const expirationDate = localStorage.getItem('expiration');

        if (!token || !expirationDate) {
            return;
        }

        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId,
            email: email
        }
    }
}