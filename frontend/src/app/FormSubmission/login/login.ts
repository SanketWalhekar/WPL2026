import { CommonModule } from '@angular/common';


import {
  Component,ChangeDetectorRef
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  AuthService
} from '../auth.service';


@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    
  ],

  templateUrl:
    './login.html',

  styleUrl:
    './login.css'

})
export class Login {


  username = '';

  password = '';

  errorMessage = '';

  isLoading = false;


  constructor(

    private authService: AuthService,

    private router: Router,
  private cdr: ChangeDetectorRef
    

  ) {}


  // =================================================
  // LOGIN
  // =================================================

  login(): void {

    // Clear old error

    this.errorMessage = '';


    // =================================================
    // VALIDATION
    // =================================================

    if (
      !this.username.trim() ||
      !this.password.trim()
    ) {

      this.errorMessage =
        'Please enter username and password.';

      return;

    }


    // =================================================
    // START LOADING
    // =================================================

    this.isLoading = true;


    console.log(
      'Login started'
    );

    console.log(
      'Username:',
      this.username
    );


    // =================================================
    // LOGIN API
    // =================================================

    this.authService

      .login(
        this.username.trim(),
        this.password
      )

      .pipe(

        // =============================================
        // ALWAYS STOP LOADING
        // =============================================

        finalize(() => {

          console.log(
            'Login request completed'
          );

          this.isLoading = false;

        })

      )

      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (response) => {

          console.log(
            'Login response:',
            response
          );


          if (
            response &&
            response.success === true
          ) {

            // =========================================
            // SAVE LOGIN SESSION
            // =========================================

            this.authService.setLoginSession(
              response.admin.username
            );


            console.log(
              'Admin login successful'
            );


            // =========================================
            // REDIRECT TO DASHBOARD
            // =========================================

            this.router.navigate([
              '/dashboard'
            ]);

          }

          else {

            this.errorMessage =
              'Wrong ID or Password.';

          }

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error) => {

          console.error(
            'Login API error:',
            error
          );


          console.log(
            'HTTP Status:',
            error?.status
          );


          console.log(
            'Backend Error:',
            error?.error
          );


          // ===========================================
          // WRONG USERNAME / PASSWORD
          // ===========================================

          if (
            error?.status === 401
          ) {

            this.errorMessage =
              'Wrong ID or Password.';

          }


          // ===========================================
          // BAD REQUEST
          // ===========================================

          else if (
            error?.status === 400
          ) {

            this.errorMessage =
              error?.error?.message ||
              'Please enter username and password.';

          }


          // ===========================================
          // SERVER ERROR
          // ===========================================

          else if (
            error?.status >= 500
          ) {

            this.errorMessage =
              'Server error. Please try again later.';

          }


          // ===========================================
          // CONNECTION ERROR
          // ===========================================

          else if (
            error?.status === 0
          ) {

            this.errorMessage =
              'Unable to connect to server.';

          }


          // ===========================================
          // OTHER ERROR
          // ===========================================

          else {

            this.errorMessage =
              'Wrong ID or Password.';

          }
          // Force UI update immediately
  this.cdr.detectChanges();

        }

      });

  }

}