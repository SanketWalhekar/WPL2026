import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import { finalize } from 'rxjs';

import { Registration } from '../registration';

import { Dashboard } from "../dashboard/dashboard";


@Component({

  selector: 'app-registration-list',

  standalone: true,

  imports: [
    CommonModule,
    Dashboard
  ],

  templateUrl: './registration-list.html',

  styleUrl: './registration-list.css'

})


export class RegistrationList
  implements OnInit {


  // =========================================
  // REGISTRATIONS
  // =========================================

  registrations: any[] = [];


  // =========================================
  // LOADING
  // =========================================

  isLoading = false;


  // =========================================
  // ERROR
  // =========================================

  errorMessage = '';


  // =========================================
  // BACKEND URL
  // =========================================



  // =========================================
  // SELECTED PLAYER
  // =========================================

  selectedRegistration: any | null = null;


  // =========================================
  // SELECTED PLAYER INDEX
  // =========================================

  selectedRegistrationIndex = -1;



  constructor(

    private registrationService: Registration,

    private cdr: ChangeDetectorRef

  ) {}



  // =========================================
  // ON INIT
  // =========================================

  ngOnInit(): void {

    console.log(
      'RegistrationList initialized'
    );

    this.getRegistrations();

  }

getImageUrl(
  imagePath: string | null | undefined
): string {

  if (!imagePath) {
    return '';
  }

  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }

  return `http://localhost:5000${imagePath}`;
}

 
  // =========================================
  // IMAGE URL
  // =========================================





  // =========================================
  // GET REGISTRATIONS
  // =========================================

  getRegistrations(): void {

    console.log(
      'GET registrations started'
    );


    this.isLoading = true;

    this.errorMessage = '';


    this.cdr.detectChanges();


    this.registrationService

      .getRegistrations()

      .pipe(

        finalize(() => {

          console.log(
            'GET registrations completed'
          );


          this.isLoading = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: (response) => {

          console.log(
            'GET response:',
            response
          );


          if (
            response &&
            response.success === true
          ) {

            this.registrations =
  response.registrations || [];

          }

          else {

            this.errorMessage =
              'Failed to load registrations.';

          }


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'GET registrations error:',
            error
          );


          this.errorMessage =
            'Unable to connect to the server.';


          this.cdr.detectChanges();

        }

      });

  }



  // =========================================
  // REFRESH
  // =========================================

  refreshRegistrations(): void {

    console.log(
      'Refresh clicked'
    );

    this.getRegistrations();

  }



  // =========================================
  // OPEN PLAYER CARD
  // =========================================

  openPlayerCard(
    registration: any,
    index: number
  ): void {


    this.selectedRegistration =
      registration;


    this.selectedRegistrationIndex =
      index;


    // Prevent background scrolling

    document.body.style.overflow =
      'hidden';

  }



  // =========================================
  // CLOSE PLAYER CARD
  // =========================================

  closePlayerCard(): void {


    this.selectedRegistration =
      null;


    this.selectedRegistrationIndex =
      -1;


    // Enable background scrolling

    document.body.style.overflow =
      '';

  }



  // =========================================
  // PREVIOUS PLAYER
  // =========================================

  previousPlayer(): void {


    if (
      !this.registrations ||
      this.registrations.length === 0
    ) {

      return;

    }


    if (
      this.selectedRegistrationIndex > 0
    ) {


      this.selectedRegistrationIndex--;


      this.selectedRegistration =
        this.registrations[
          this.selectedRegistrationIndex
        ];

    }

  }



  // =========================================
  // NEXT PLAYER
  // =========================================

  nextPlayer(): void {


    if (
      !this.registrations ||
      this.registrations.length === 0
    ) {

      return;

    }


    if (
      this.selectedRegistrationIndex <
      this.registrations.length - 1
    ) {


      this.selectedRegistrationIndex++;


      this.selectedRegistration =
        this.registrations[
          this.selectedRegistrationIndex
        ];

    }

  }



  // =========================================
  // DOWNLOAD PDF
  // =========================================

  downloadPDF(): void {


    if (
      !this.registrations ||
      this.registrations.length === 0
    ) {

      return;

    }



    const doc = new jsPDF({

      orientation: 'landscape',

      unit: 'mm',

      format: 'a4'

    });



    // =========================================
    // TITLE
    // =========================================

    doc.setFontSize(20);

    doc.setFont(
      'helvetica',
      'bold'
    );


    doc.text(

      'Walhekar Premier League 2026',

      148,

      15,

      {
        align: 'center'
      }

    );



    // =========================================
    // SUBTITLE
    // =========================================

    doc.setFontSize(12);

    doc.setFont(
      'helvetica',
      'normal'
    );


    doc.text(

      'Registration Records',

      148,

      23,

      {
        align: 'center'
      }

    );



    // =========================================
    // TOTAL
    // =========================================

    doc.setFontSize(10);


    doc.text(

      `Total Registrations: ${this.registrations.length}`,

      14,

      32

    );



    // =========================================
    // TABLE DATA
    // =========================================

    const tableData =
      this.registrations.map(

        (
          registration,
          index
        ) => [


          index + 1,


          registration.playerName ||
          '-',


          registration.registrationType ===
          'player'

            ? 'Player'

            : 'T-Shirt',


          registration.phoneNumber ||
          '-',


          registration.registrationType ===
          'player'

            ? registration.category ||
              '-'

            : 'N/A',


          registration.tshirtSize ||
          '-',


          registration.otherSize ||
          '-',


          registration.tshirtName ||
          '-',


          registration.createdAt

            ? new Date(
                registration.createdAt
              ).toLocaleDateString(
                'en-IN'
              )

            : '-'

        ]

      );



    // =========================================
    // CREATE TABLE
    // =========================================

    autoTable(

      doc,

      {

        startY: 38,


        head: [[

          '#',

          'Player Name',

          'Type',

          'Phone',

          'Category',

          'T-Shirt Size',

          'Other Size',

          'T-Shirt Name',

          'Registered On'

        ]],


        body: tableData,


        theme: 'grid',


        styles: {

          fontSize: 8,

          cellPadding: 3,

          valign: 'middle'

        },


        headStyles: {

          fontSize: 8,

          fontStyle: 'bold'

        },


        margin: {

          top: 38,

          left: 10,

          right: 10

        }

      }

    );



    // =========================================
    // FOOTER
    // =========================================

    const pageCount =
      (doc as any)
        .internal
        .getNumberOfPages();



    for (

      let page = 1;

      page <= pageCount;

      page++

    ) {


      doc.setPage(page);


      doc.setFontSize(8);


      doc.text(

        `WPL 2026 - Registration Records | Page ${page} of ${pageCount}`,

        148,

        200,

        {
          align: 'center'
        }

      );

    }



    // =========================================
    // SAVE
    // =========================================

    doc.save(
      'WPL-2026-Registration-Records.pdf'
    );

  }

}