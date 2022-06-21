import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuth$ = new BehaviorSubject<boolean>(false);
  private authToken = '';
  private userId = '';
  private admin = false;

  constructor(private http: HttpClient,
              private router: Router) {}

  createUser(email: string, password: string) {
    return this.http.post<{ message: string }>('http://localhost:3000/api/auth/signup', {email: email, password: password});
  }

  getToken() {
    return this.authToken;
  }

  getUserId() {
    return this.userId;
  }

  getAdmin() {
    return this.admin;
  }

  loginUser(email: string, password: string) {
    return this.http.post<{ userId: string, token: string, admin: boolean }>('http://localhost:3000/api/auth/login', {email: email, password: password}).pipe(
      tap(({ userId, admin, token }) => {
        this.userId = userId;
        this.admin = admin;
        this.authToken = token;
        this.isAuth$.next(true);
      })
    );
  }

  logout() {
    this.authToken = '';
    this.userId = '';
    this.isAuth$.next(false);
    this.router.navigate(['login']);
  }

}