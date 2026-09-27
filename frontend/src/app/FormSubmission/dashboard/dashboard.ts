import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { Header } from '../header/header';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    Header,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  public loggedIn: boolean = false;

  public adminUsername: string | null = null;


  constructor(
    private authService: AuthService
  ) {}


  ngOnInit(): void {

    this.loggedIn =
      this.authService.isLoggedIn();

    this.adminUsername =
      this.authService.getAdminUsername();

    console.log(
      'Logged In:',
      this.loggedIn
    );

    console.log(
      'Admin Username:',
      this.adminUsername
    );

  }

}