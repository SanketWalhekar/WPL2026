import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  // =================================================
  // LOGIN STATUS
  // =================================================

  isLoggedIn = false;


  // =================================================
  // CONSTRUCTOR
  // =================================================

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  // =================================================
  // ON INIT
  // =================================================

  ngOnInit(): void {

    this.checkLoginStatus();

  }


  // =================================================
  // CHECK LOGIN STATUS
  // =================================================

  checkLoginStatus(): void {

    this.isLoggedIn =
      this.authService.isLoggedIn();

  }


  // =================================================
  // LOGIN
  // =================================================

  login(): void {

    this.router.navigate([
      '/login'
    ]);

  }


  // =================================================
  // LOGOUT
  // =================================================

  logout(): void {

    // Clear sessionStorage
    this.authService.logout();

    // Update header immediately
    this.isLoggedIn = false;

    // Redirect to login page
    this.router.navigate([
      '/form'
    ]);

  }

}