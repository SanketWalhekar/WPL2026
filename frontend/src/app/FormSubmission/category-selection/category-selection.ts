import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  finalize
} from 'rxjs';

import {
  Registration
} from '../registration';


@Component({

  selector:
    'app-category-selection',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './category-selection.html',

  styleUrl:
    './category-selection.css'

})


export class CategorySelection
  implements OnInit {


  // ==================================================
  // CATEGORY NAME
  // ==================================================

  categoryName = '';


  // ==================================================
  // PLAYERS
  // ==================================================

  players: any[] = [];


  // ==================================================
  // SELECTED PLAYERS
  // ==================================================

  selectedPlayers: any[] = [];


  // ==================================================
  // LOADING
  // ==================================================

  isLoading = false;


  // ==================================================
  // SAVING
  // ==================================================

  isSaving = false;


  // ==================================================
  // ERROR
  // ==================================================

  errorMessage = '';


  // ==================================================
  // PREVIEW
  // ==================================================

  showPreview = false;


  constructor(

    private registrationService:
      Registration,

    private cdr:
      ChangeDetectorRef

  ) {}


  // ==================================================
  // INIT
  // ==================================================

  ngOnInit(): void {

    this.loadPlayers();

  }


  // ==================================================
  // LOAD PLAYERS
  // ==================================================

  loadPlayers(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.registrationService
      .getCategoryPlayers()

      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response) => {

          console.log(
            'Players response:',
            response
          );


          if (
            response &&
            response.success === true
          ) {

            this.players =
              response.data || [];

          }

          else {

            this.errorMessage =
              response?.message ||
              'Failed to load players.';

          }

        },


        error: (error) => {

          console.error(
            'Load players error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to connect to server.';

        }

      });

  }


  // ==================================================
  // CHECK PLAYER SELECTED
  // ==================================================

  isPlayerSelected(
    player: any
  ): boolean {

    return this.selectedPlayers.some(

      selected =>

        selected._id ===
        player._id

    );

  }


  // ==================================================
  // SELECT / UNSELECT PLAYER
  // ==================================================

  // ==================================================
// SELECT / UNSELECT PLAYER
// ==================================================

togglePlayer(player: any): void {

  // ==============================================
  // PLAYER ALREADY BELONGS TO ANOTHER CATEGORY
  // ==============================================

  if (player.isAssigned) {

    return;

  }


  // ==============================================
  // CHECK CURRENT SELECTION
  // ==============================================

  const index =
    this.selectedPlayers.findIndex(

      selected =>
        selected._id === player._id

    );


  // ==============================================
  // SELECT
  // ==============================================

  if (index === -1) {

    this.selectedPlayers.push(player);

  }


  // ==============================================
  // UNSELECT
  // ==============================================

  else {

    this.selectedPlayers.splice(
      index,
      1
    );

  }

}


  // ==================================================
  // PREVIEW
  // ==================================================

  previewCategory(): void {

    if (
      !this.categoryName.trim()
    ) {

      alert(
        'Please enter category name.'
      );

      return;

    }


    if (
      this.selectedPlayers.length === 0
    ) {

      alert(
        'Please select at least one player.'
      );

      return;

    }


    this.showPreview = true;

  }


  // ==================================================
  // BACK TO SELECTION
  // ==================================================

  backToSelection(): void {

    this.showPreview = false;

  }


  // ==================================================
  // SAVE CATEGORY
  // ==================================================

  saveCategory(): void {

    if (
      !this.categoryName.trim()
    ) {

      alert(
        'Please enter category name.'
      );

      return;

    }


    if (
      this.selectedPlayers.length === 0
    ) {

      alert(
        'Please select at least one player.'
      );

      return;

    }


    // ================================================
    // PREPARE DATA
    // ================================================

    const categoryData = {

      categoryName:
        this.categoryName.trim(),

      players:

        this.selectedPlayers.map(
          (player: any) => ({

            registrationId:
              player._id,

            playerName:
              player.playerName || '',

            phoneNumber:
              player.phoneNumber || '',

            category:
              player.category || '',

            playerPhoto:
              player.playerPhoto || '',

            tshirtSize:
              player.tshirtSize || '',

            otherSize:
              player.otherSize || '',

            tshirtName:
              player.tshirtName || ''

          })
        )

    };


    console.log(
      'Category data:',
      categoryData
    );


    // ================================================
    // SAVE
    // ================================================

    this.isSaving = true;


    this.registrationService

      .saveCategory(
        categoryData
      )

      .pipe(

        finalize(() => {

          this.isSaving = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response) => {

          console.log(
            'Save category response:',
            response
          );


          if (
            response &&
            response.success === true
          ) {

            alert(
              'Category saved successfully!'
            );


            // RESET

            this.categoryName = '';

            this.selectedPlayers = [];

            this.showPreview = false;

          }

          else {

            alert(

              response?.message ||

              'Failed to save category.'

            );

          }

        },


        error: (error) => {

          console.error(
            'Save category error:',
            error
          );


          alert(

            error?.error?.message ||

            'Unable to save category.'

          );

        }

      });

  }
isPlayerAssigned(player: any): boolean {

  return player.isAssigned === true;

}

  // ==================================================
  // REFRESH
  // ==================================================

  refreshPlayers(): void {

    this.selectedPlayers = [];

    this.loadPlayers();

  }

}