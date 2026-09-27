import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Registration } from '../registration';
// Change the import path above according to your project structure.

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './auction.html',
  styleUrls: ['./auction.css']
})
export class Auction implements OnInit {

  // ============================================================
  // PAGE / TABS
  // ============================================================

  activeSection:
    | 'teams'
    | 'settings'
    | 'auction'
    | 'review' = 'teams';

  // ============================================================
  // TEAM
  // ============================================================

  teamName = '';
  owner1 = '';
  owner2 = '';

  teams: any[] = [];

  isAddingTeam = false;

  // ============================================================
  // AUCTION SETTINGS
  // ============================================================

  maximumPoints: number | null = null;
  minimumPlayerPoints: number | null = null;
  playersPerTeam: number | null = null;

  isSavingSettings = false;
  settingsSaved = false;

  // ============================================================
  // CATEGORIES
  // ============================================================

  categories: any[] = [];

  selectedCategory: any = null;

  isLoadingCategories = false;

  // ============================================================
  // PLAYERS
  // ============================================================

  auctionPlayers: any[] = [];

  currentPlayerIndex = 0;

  currentPlayer: any = null;

  isLoadingPlayers = false;
  

  // ============================================================
  // SOLD POPUP
  // ============================================================

  showSoldPopup = false;

  selectedTeamId = '';

  soldPoints: number | null = null;

  isSellingPlayer = false;

  sellErrorMessage = '';

  // ============================================================
  // TEAM REVIEW
  // ============================================================

  teamReview: any[] = [];

  isLoadingReview = false;

  // ============================================================
  // GENERAL
  // ============================================================

  errorMessage = '';

  successMessage = '';

  constructor(
    private registrationService: Registration,
    private cdr: ChangeDetectorRef
  ) {}

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.loadTeams();
    this.loadCategories();
    this.loadTeamReview();

  }

  // ============================================================
  // SECTION
  // ============================================================

  changeSection(
    section:
      | 'teams'
      | 'settings'
      | 'auction'
      | 'review'
  ): void {

    this.activeSection = section;

    this.errorMessage = '';
    this.successMessage = '';

    if (section === 'teams') {
      this.loadTeams();
    }

    if (section === 'auction') {

      this.loadCategories();

      if (this.selectedCategory) {

        this.loadCategoryPlayers(
          this.selectedCategory._id
        );

      }

    }

    if (section === 'review') {
      this.loadTeamReview();
    }

  }

  // ============================================================
  // TEAMS
  // ============================================================

  loadTeams(): void {

    this.registrationService
      .getAuctionTeams()
      .subscribe({

        next: (response: any) => {

          if (response?.success) {

            this.teams = response.data || [];

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to load teams.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'LOAD TEAMS ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load teams.';

          this.cdr.detectChanges();

        }

      });

  }

  addTeam(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.teamName.trim()) {

      this.errorMessage =
        'Please enter team name.';

      return;
    }

    if (!this.owner1.trim()) {

      this.errorMessage =
        'Please enter Owner 1 name.';

      return;
    }

    if (!this.owner2.trim()) {

      this.errorMessage =
        'Please enter Owner 2 name.';

      return;
    }

    const teamData = {

      teamName:
        this.teamName.trim(),

      owner1:
        this.owner1.trim(),

      owner2:
        this.owner2.trim()

    };

    this.isAddingTeam = true;

    this.registrationService
      .addAuctionTeam(teamData)
      .subscribe({

        next: (response: any) => {

          this.isAddingTeam = false;

          if (response?.success) {

            this.successMessage =
              'Team added successfully.';

            this.teamName = '';
            this.owner1 = '';
            this.owner2 = '';

            this.loadTeams();

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to add team.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          this.isAddingTeam = false;

          console.error(
            'ADD TEAM ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to add team.';

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // AUCTION SETTINGS
  // ============================================================

  saveAuctionSettings(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      this.maximumPoints === null ||
      this.maximumPoints <= 0
    ) {

      this.errorMessage =
        'Please enter maximum auction points.';

      return;
    }

    if (
      this.minimumPlayerPoints === null ||
      this.minimumPlayerPoints <= 0
    ) {

      this.errorMessage =
        'Please enter minimum player points.';

      return;
    }

    if (
      this.playersPerTeam === null ||
      this.playersPerTeam <= 0
    ) {

      this.errorMessage =
        'Please enter players per team.';

      return;
    }

    const minimumRequired =
      this.minimumPlayerPoints *
      this.playersPerTeam;

    if (
      minimumRequired >
      this.maximumPoints
    ) {

      this.errorMessage =
        `Invalid settings. Every team needs at least ${minimumRequired} points (${this.minimumPlayerPoints} × ${this.playersPerTeam}).`;

      return;
    }

    if (this.teams.length === 0) {

      this.errorMessage =
        'Please create at least one team before saving auction settings.';

      return;
    }

    const data = {

      maximumPoints:
        Number(this.maximumPoints),

      minimumPlayerPoints:
        Number(this.minimumPlayerPoints),

      playersPerTeam:
        Number(this.playersPerTeam)

    };

    this.isSavingSettings = true;

    this.registrationService
      .saveAuctionSettings(data)
      .subscribe({

        next: (response: any) => {

          this.isSavingSettings = false;

          if (response?.success) {

            this.settingsSaved = true;

            this.successMessage =
              'Auction settings saved successfully.';

            this.activeSection = 'auction';

            this.initializeAuctionPlayers();

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to save auction settings.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          this.isSavingSettings = false;

          console.error(
            'SAVE SETTINGS ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to save auction settings.';

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // INITIALIZE AUCTION PLAYERS
  // ============================================================

  initializeAuctionPlayers(): void {

    this.registrationService
      .initializeAuctionPlayers()
      .subscribe({

        next: (response: any) => {

          if (response?.success) {

            this.loadCategories();

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to initialize players.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'INITIALIZE PLAYERS ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to initialize auction players.';

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // CATEGORIES
  // ============================================================

  loadCategories(): void {

    this.isLoadingCategories = true;

    this.registrationService
      .getAuctionCategories()
      .subscribe({

        next: (response: any) => {

          this.isLoadingCategories = false;

          if (response?.success) {

            this.categories =
              response.data || [];

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to load categories.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          this.isLoadingCategories = false;

          console.error(
            'LOAD CATEGORIES ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load categories.';

          this.cdr.detectChanges();

        }

      });

  }

  selectCategory(category: any): void {

    this.selectedCategory = category;

    this.currentPlayer = null;
    this.currentPlayerIndex = 0;
    this.auctionPlayers = [];

    this.loadCategoryPlayers(
      category._id
    );

  }

  loadCategoryPlayers(categoryId: string): void {

    this.isLoadingPlayers = true;

    this.registrationService
      .getAuctionCategoryPlayers(categoryId)
      .subscribe({

        next: (response: any) => {

          this.isLoadingPlayers = false;

          if (response?.success) {

            this.auctionPlayers =
              response.data || [];

            this.currentPlayerIndex = 0;

            if (this.auctionPlayers.length > 0) {

              this.currentPlayer =
                this.auctionPlayers[0];

            } else {

              this.currentPlayer = null;

            }

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to load players.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          this.isLoadingPlayers = false;

          console.error(
            'LOAD CATEGORY PLAYERS ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load category players.';

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // PLAYER NAVIGATION
  // ============================================================

  selectPlayer(
    player: any,
    index: number
  ): void {

    this.currentPlayer = player;

    this.currentPlayerIndex = index;

  }

  nextPlayer(): void {

    if (
      this.currentPlayerIndex <
      this.auctionPlayers.length - 1
    ) {

      this.currentPlayerIndex++;

      this.currentPlayer =
        this.auctionPlayers[
          this.currentPlayerIndex
        ];

    }

  }

  previousPlayer(): void {

    if (
      this.currentPlayerIndex > 0
    ) {

      this.currentPlayerIndex--;

      this.currentPlayer =
        this.auctionPlayers[
          this.currentPlayerIndex
        ];

    }

  }

  // ============================================================
  // CATEGORY COMPLETION
  // ============================================================

  getCategorySoldCount(): number {

    return this.auctionPlayers.filter(
      player =>
        player.status === 'SOLD'
    ).length;

  }

  getCategoryAvailableCount(): number {

    return this.auctionPlayers.filter(
      player =>
        player.status === 'AVAILABLE'
    ).length;

  }

  isCategoryCompleted(): boolean {

    return (
      this.auctionPlayers.length > 0 &&
      this.getCategoryAvailableCount() === 0
    );

  }

  goToNextCategory(): void {

    if (!this.selectedCategory) {
      return;
    }

    const currentIndex =
      this.categories.findIndex(
        category =>
          category._id ===
          this.selectedCategory._id
      );

    if (
      currentIndex >= 0 &&
      currentIndex <
        this.categories.length - 1
    ) {

      const nextCategory =
        this.categories[currentIndex + 1];

      this.selectCategory(
        nextCategory
      );

    } else {

      this.loadTeamReview();

      this.activeSection = 'review';

    }

  }

  // ============================================================
  // SOLD POPUP
  // ============================================================

  openSoldPopup(): void {

    this.sellErrorMessage = '';

    if (!this.currentPlayer) {

      return;

    }

    if (
      this.currentPlayer.status ===
      'SOLD'
    ) {

      return;

    }

    this.selectedTeamId = '';
    this.soldPoints = null;

    this.showSoldPopup = true;

  }

  closeSoldPopup(): void {

    if (this.isSellingPlayer) {
      return;
    }

    this.showSoldPopup = false;

    this.selectedTeamId = '';
    this.soldPoints = null;

    this.sellErrorMessage = '';

  }

  // ============================================================
  // CLIENT SIDE MAX BID CALCULATION
  // ============================================================

  getTeamPurchasedCount(
    teamId: string
  ): number {

    const team =
      this.teamReview.find(
        item =>
          item.teamId?.toString() ===
          teamId?.toString()
      );

    return team?.playersBought || 0;

  }

  getTeamSpentPoints(
    teamId: string
  ): number {

    const team =
      this.teamReview.find(
        item =>
          item.teamId?.toString() ===
          teamId?.toString()
      );

    return team?.spentPoints || 0;

  }

  getMaximumAllowedBid(
    teamId: string
  ): number {

    if (
      !teamId ||
      this.maximumPoints === null ||
      this.minimumPlayerPoints === null ||
      this.playersPerTeam === null
    ) {

      return 0;

    }

    const playersBought =
      this.getTeamPurchasedCount(
        teamId
      );

    const spent =
      this.getTeamSpentPoints(
        teamId
      );

    const playersRemainingAfterPurchase =
      this.playersPerTeam -
      (playersBought + 1);

    const remainingBudget =
      this.maximumPoints -
      spent;

    const reserve =
      playersRemainingAfterPurchase *
      this.minimumPlayerPoints;

    return Math.max(
      0,
      remainingBudget - reserve
    );

  }

  getRemainingBudgetForTeam(
    teamId: string
  ): number {

    if (
      this.maximumPoints === null
    ) {
      return 0;
    }

    return (
      this.maximumPoints -
      this.getTeamSpentPoints(teamId)
    );

  }

  // ============================================================
  // SOLD PLAYER
  // ============================================================

  confirmSold(): void {

    this.sellErrorMessage = '';

    if (!this.currentPlayer) {

      this.sellErrorMessage =
        'No player selected.';

      return;

    }

    if (!this.selectedTeamId) {

      this.sellErrorMessage =
        'Please select a team.';

      return;

    }

    if (
      this.soldPoints === null ||
      this.soldPoints <= 0
    ) {

      this.sellErrorMessage =
        'Please enter valid sold points.';

      return;

    }

    if (
      this.minimumPlayerPoints !== null &&
      this.soldPoints <
        this.minimumPlayerPoints
    ) {

      this.sellErrorMessage =
        `Minimum player price is ${this.minimumPlayerPoints} points.`;

      return;

    }

    const maximumAllowed =
      this.getMaximumAllowedBid(
        this.selectedTeamId
      );

    if (
      this.soldPoints >
      maximumAllowed
    ) {

      this.sellErrorMessage =
        `Maximum allowed bid for this player is ${maximumAllowed} points.`;

      return;

    }

    this.isSellingPlayer = true;

    const data = {

      playerId:
        this.currentPlayer._id,

      teamId:
        this.selectedTeamId,

      soldPoints:
        Number(this.soldPoints)

    };

    this.registrationService
      .sellAuctionPlayer(data)
      .subscribe({

        next: (response: any) => {

          this.isSellingPlayer = false;

          if (response?.success) {

            this.showSoldPopup = false;

            /*
             * Update current player
             */

            this.currentPlayer =
              response.data.player;

            /*
             * Update list
             */

            const playerIndex =
              this.auctionPlayers.findIndex(
                player =>
                  player._id ===
                  this.currentPlayer._id
              );

            if (playerIndex !== -1) {

              this.auctionPlayers[
                playerIndex
              ] = response.data.player;

            }

            this.successMessage =
              response.message ||
              'Player sold successfully.';

            this.selectedTeamId = '';
            this.soldPoints = null;

            /*
             * Refresh team review
             */

            this.loadTeamReview();

            this.cdr.detectChanges();

          } else {

            this.sellErrorMessage =
              response?.message ||
              'Player could not be sold.';

          }

        },

        error: (error: any) => {

          this.isSellingPlayer = false;

          console.error(
            'SELL PLAYER ERROR:',
            error
          );

          this.sellErrorMessage =
            error?.error?.message ||
            'Player could not be sold.';

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // TEAM REVIEW
  // ============================================================

  loadTeamReview(): void {

    this.isLoadingReview = true;

    this.registrationService
      .getAuctionTeamReview()
      .subscribe({

        next: (response: any) => {

          this.isLoadingReview = false;

          if (response?.success) {

            this.teamReview =
              response.data || [];

            /*
             * If settings weren't entered
             * in this page yet, take them
             * from backend review.
             */

            if (
              this.teamReview.length > 0
            ) {

              const firstTeam =
                this.teamReview[0];

              if (
                this.maximumPoints === null &&
                firstTeam.maximumPoints
              ) {

                this.maximumPoints =
                  firstTeam.maximumPoints;

              }

            }

          } else {

            this.errorMessage =
              response?.message ||
              'Failed to load team review.';

          }

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          this.isLoadingReview = false;

          console.error(
            'TEAM REVIEW ERROR:',
            error
          );

          /*
           * Don't show a big error when
           * auction has not been configured yet.
           */

          this.teamReview = [];

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // TEAM REVIEW HELPERS
  // ============================================================

  getTeamProgressPercentage(
    team: any
  ): number {

    const total =
      team.playersBought +
      team.playersRemaining;

    if (!total) {
      return 0;
    }

    return Math.round(
      (team.playersBought / total) *
      100
    );

  }

  // ============================================================
  // DELETE / RESET HELPERS
  // ============================================================

  clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';
    this.sellErrorMessage = '';

  }

}

