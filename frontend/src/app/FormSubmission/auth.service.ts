import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl =
    '/api/auth';

  private isBrowser: boolean;


  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.isBrowser =
      isPlatformBrowser(this.platformId);

  }


  // =================================================
  // LOGIN
  // =================================================

  login(
    username: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/login`,
      {
        username,
        password
      }
    );

  }


  // =================================================
  // SET LOGIN SESSION
  // =================================================

  setLoginSession(
    username: string
  ): void {

    if (!this.isBrowser) {
      return;
    }

    sessionStorage.setItem(
      'adminLoggedIn',
      'true'
    );

    sessionStorage.setItem(
      'adminUsername',
      username
    );

  }


  // =================================================
  // CHECK LOGIN
  // =================================================

  isLoggedIn(): boolean {

    if (!this.isBrowser) {
      return false;
    }

    return (
      sessionStorage.getItem(
        'adminLoggedIn'
      ) === 'true'
    );

  }


  // =================================================
  // GET ADMIN USERNAME
  // =================================================

  getAdminUsername(): string | null {

    if (!this.isBrowser) {
      return null;
    }

    return sessionStorage.getItem(
      'adminUsername'
    );

  }


  // =================================================
  // LOGOUT
  // =================================================

  logout(): void {

    if (!this.isBrowser) {
      return;
    }

    sessionStorage.removeItem(
      'adminLoggedIn'
    );

    sessionStorage.removeItem(
      'adminUsername'
    );

  }

}