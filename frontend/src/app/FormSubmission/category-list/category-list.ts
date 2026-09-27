import { CommonModule } from '@angular/common';
import {
  FormsModule
} from '@angular/forms';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  Registration
} from '../registration';

@Component({

  selector:
    'app-category-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './category-list.html',

  styleUrl:
    './category-list.css'

})
export class CategoryList
  implements OnInit {

    // =========================================
// EDIT MODE
// =========================================

isEditMode = false;

editingCategory: any | null = null;

allPlayers: any[] = [];

editCategoryName = '';

editSelectedPlayers: any[] = [];

isSavingEdit = false;

editErrorMessage = '';


  // =========================================
  // ALL CATEGORIES
  // =========================================

  categories: any[] = [];


  // =========================================
  // SELECTED CATEGORY
  // =========================================

  selectedCategory: any | null = null;


  // =========================================
  // LOADING
  // =========================================

  isLoading = false;


  // =========================================
  // ERROR
  // =========================================

  errorMessage = '';


  constructor(

    private registrationService:
      Registration,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.loadCategories();

  }

  downloadCategoryPdf(): void {

  if (!this.selectedCategory) {
    return;
  }

  const category = this.selectedCategory;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Player List', 14, 20);

  // Category name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Category: ${category.categoryName}`, 14, 30);

  // Total players
  doc.text(
    `Total Players: ${category.players?.length || 0}`,
    14,
    38
  );

  // Date
  doc.setFontSize(10);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
    14,
    46
  );

  const tableData = (category.players || []).map(
    (player: any, index: number) => [
      index + 1,
      player.playerName || '-',
      player.phoneNumber || '-',
      player.category || '-',
      player.tshirtSize || '-',
      player.tshirtName || '-',
      player.otherSize || '-'
    ]
  );

  autoTable(doc, {
    startY: 55,

    head: [[
      '#',
      'Player Name',
      'Phone',
      'Category',
      'T-Shirt',
      'T-Shirt Name',
      'Other Size'
    ]],

    body: tableData,

    theme: 'grid',

    styles: {
      fontSize: 8,
      cellPadding: 3
    },

    headStyles: {
      fontStyle: 'bold'
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  const fileName =
    `${category.categoryName.replace(/\s+/g, '_')}_Players.pdf`;

  doc.save(fileName);
}


  // =========================================
// EDIT CATEGORY
// =========================================

editCategory(category: any): void {

  this.isEditMode = true;

  this.editingCategory = category;

  this.editCategoryName =
    category.categoryName || '';

  this.editSelectedPlayers = [
    ...(category.players || [])
  ];

  this.editErrorMessage = '';

  // Load all registered players
  this.loadPlayersForEdit();

}

// =========================================
// LOAD PLAYERS FOR EDIT
// =========================================

loadPlayersForEdit(): void {

  this.isLoading = true;

  this.editErrorMessage = '';

  this.registrationService
    .getCategoryPlayers()
    .subscribe({

      next: (response) => {

        console.log(
          'Players for edit:',
          response
        );

        if (
          response &&
          response.success === true
        ) {

          this.allPlayers =
            response.data || [];

          /*
           * Make sure players already belonging
           * to the current category are selectable.
           */

          this.allPlayers =
            this.allPlayers.map(
              (player: any) => {

                const currentCategoryPlayer =
                  this.editSelectedPlayers.find(
                    selected =>
                      selected.registrationId ===
                      player._id
                  );

                if (currentCategoryPlayer) {

                  return {

                    ...player,

                    isAssigned: true,

                    assignedCategory:
                      this.editingCategory.categoryName,

                    isCurrentCategory: true

                  };

                }

                return player;

              }
            );

        }

        else {

          this.editErrorMessage =
            response?.message ||
            'Failed to load players.';

        }

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Load players for edit error:',
          error
        );

        this.editErrorMessage =
          error?.error?.message ||
          'Unable to load players.';

        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });

}

// =========================================
// CHECK PLAYER SELECTED IN EDIT
// =========================================

isEditPlayerSelected(
  player: any
): boolean {

  return this.editSelectedPlayers.some(

    selected => {

      const selectedId =
        selected.registrationId ||
        selected._id;

      return selectedId === player._id;

    }

  );

}

// =========================================
// CHECK PLAYER BELONGS TO ANOTHER CATEGORY
// =========================================

isPlayerInAnotherCategory(
  player: any
): boolean {

  return (
    player.isAssigned === true &&
    player.isCurrentCategory !== true
  );

}

// =========================================
// ADD / REMOVE PLAYER
// =========================================

toggleEditPlayer(
  player: any
): void {

  // =========================================
  // PLAYER BELONGS TO ANOTHER CATEGORY
  // =========================================

  if (
    this.isPlayerInAnotherCategory(player)
  ) {

    return;

  }


  // =========================================
  // FIND PLAYER
  // =========================================

  const index =
    this.editSelectedPlayers.findIndex(
      selected => {

        const selectedId =
          selected.registrationId ||
          selected._id;

        return selectedId === player._id;

      }
    );


  // =========================================
  // ADD
  // =========================================

  if (index === -1) {

    this.editSelectedPlayers.push({

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

    });

  }


  // =========================================
  // REMOVE
  // =========================================

  else {

    this.editSelectedPlayers.splice(
      index,
      1
    );

  }

}

// =========================================
// CANCEL EDIT
// =========================================

cancelEdit(): void {

  this.isEditMode = false;

  this.editingCategory = null;

  this.editCategoryName = '';

  this.editSelectedPlayers = [];

  this.allPlayers = [];

  this.editErrorMessage = '';

}

// =========================================
// SAVE EDITED CATEGORY
// =========================================

saveEditedCategory(): void {

  // =========================================
  // VALIDATE CATEGORY NAME
  // =========================================

  if (
    !this.editCategoryName.trim()
  ) {

    alert(
      'Please enter category name.'
    );

    return;

  }


  // =========================================
  // VALIDATE PLAYERS
  // =========================================

  if (
    this.editSelectedPlayers.length === 0
  ) {

    alert(
      'Please select at least one player.'
    );

    return;

  }


  // =========================================
  // PREPARE DATA
  // =========================================

  const categoryData = {

    categoryName:
      this.editCategoryName.trim(),

    players:
      this.editSelectedPlayers.map(
        (player: any) => ({

          registrationId:
            player.registrationId ||
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
    'Updated category:',
    categoryData
  );


  this.isSavingEdit = true;


  this.registrationService
    .updateCategory(
      this.editingCategory._id,
      categoryData
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Update category response:',
          response
        );


        if (
          response &&
          response.success === true
        ) {

          alert(
            'Category updated successfully!'
          );


          this.cancelEdit();


          this.loadCategories();

        }

        else {

          alert(
            response?.message ||
            'Failed to update category.'
          );

        }


        this.isSavingEdit = false;

        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'Update category error:',
          error
        );


        alert(
          error?.error?.message ||
          'Failed to update category.'
        );


        this.isSavingEdit = false;

        this.cdr.detectChanges();

      }

    });

}

  // =========================================
  // GET CATEGORIES
  // =========================================

  loadCategories(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.registrationService

      .getCategories()

      .subscribe({

        next: (response) => {

          console.log(
            'Categories:',
            response
          );


          if (
            response &&
            response.success === true
          ) {

            this.categories =
              response.data || [];

          }

          else {

            this.errorMessage =
              response?.message ||
              'Failed to load categories.';

          }


          this.isLoading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Get categories error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load categories.';


          this.isLoading = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================
  // SELECT CATEGORY
  // =========================================

  selectCategory(
    category: any
  ): void {

    this.selectedCategory =
      category;

  }


  // =========================================
  // BACK TO CATEGORY LIST
  // =========================================

  backToCategories(): void {

    this.selectedCategory =
      null;

  }


  // =========================================
  // DELETE CATEGORY
  // =========================================

  deleteCategory(
    category: any
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete "${category.categoryName}"?`
      );


    if (!confirmed) {

      return;

    }


    this.registrationService

      .deleteCategory(
        category._id
      )

      .subscribe({

        next: (response) => {

          if (
            response &&
            response.success
          ) {

            alert(
              'Category deleted successfully.'
            );


            this.selectedCategory =
              null;


            this.loadCategories();

          }

          else {

            alert(
              response?.message ||
              'Failed to delete category.'
            );

          }

        },


        error: (error) => {

          console.error(
            'Delete category error:',
            error
          );


          alert(
            error?.error?.message ||
            'Failed to delete category.'
          );

        }

      });

  }

}