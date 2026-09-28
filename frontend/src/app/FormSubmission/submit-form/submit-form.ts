import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';
import { Registration } from '../registration';
import { Router } from '@angular/router';
import { Header } from "../header/header";
import { Dashboard } from "../dashboard/dashboard";

@Component({
  selector: 'app-submit-form',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Dashboard
],

  templateUrl: './submit-form.html',
  styleUrl: './submit-form.css',
})
export class SubmitForm {
  showSuccessPopup: boolean = false;
  isSubmitting: boolean = false;
  registrationType: string = 'player';
  playerName: string = '';
  phoneNumber: string = '';
  category: string = '';
  tshirtSize: string = '';
  otherSize: string = '';
  tshirtName: string = '';
  playerPhoto: File | null = null;
  paymentScreenshot: File | null = null;
  paymentType: string = 'online';

  constructor(
  private registrationService: Registration,
  private cdr: ChangeDetectorRef,
  private router: Router

) {
  this.showSuccessPopup = false;
}

  // ==============================
  // IMAGE COMPRESSION (NEW)
  // ==============================

  private compressImage(file: File, maxSize = 1280, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return resolve(file);
            resolve(
              new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
            );
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // fall back to the original if it can't be decoded
      };

      img.src = url;
    });
  }

  // CHANGED: now async + compresses the image
  async onPlayerPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.playerPhoto = await this.compressImage(input.files[0]);
    }
  }

  // CHANGED: now async + compresses the image
  async onPaymentScreenshotSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.paymentScreenshot = await this.compressImage(input.files[0]);
    }
  }

  submitForm(form: NgForm): void {

  if (this.isSubmitting) {
    return;
  }

  // Trigger Angular validation
  form.control.markAllAsTouched();

  // Check normal fields
  if (form.invalid) {
    return;
  }

  // ==============================
  // PLAYER PHOTO REQUIRED
  // ==============================

  if (
    this.registrationType === 'player' &&
    !this.playerPhoto
  ) {
    return;
  }

  // ==============================
  // PAYMENT SCREENSHOT REQUIRED
  // ==============================

  if (
  this.paymentType === 'online' &&
  !this.paymentScreenshot
) {
  return;
}

  // ==============================
  // EVERYTHING VALID
  // ==============================

  this.isSubmitting = true;

  const formData = new FormData();

  formData.append(
    'registrationType',
    this.registrationType
  );

  formData.append(
    'playerName',
    this.playerName
  );

  formData.append(
    'phoneNumber',
    this.phoneNumber
  );

  if (this.registrationType === 'player') {
  formData.append('category', this.category);
}


  formData.append(
    'tshirtSize',
    this.tshirtSize
  );

  formData.append(
    'otherSize',
    this.otherSize
  );

  formData.append('paymentType', this.paymentType);

  formData.append(
    'tshirtName',
    this.tshirtName
  );

  // PLAYER PHOTO
  if (this.playerPhoto) {
    formData.append(
      'playerPhoto',
      this.playerPhoto,
      this.playerPhoto.name
    );
  }

  // PAYMENT SCREENSHOT
  if (this.paymentScreenshot) {
    formData.append(
      'paymentScreenshot',
      this.paymentScreenshot,
      this.paymentScreenshot.name
    );
  }

  this.registrationService
    .saveRegistration(formData)
    .pipe(
      finalize(() => {
  this.isSubmitting = false;
  this.cdr.detectChanges();
})
    )
    .subscribe({

      next: (response) => {

  console.log('Backend response:', response);

  if (response?.success === true) {

    console.log('Registration saved successfully');

    this.resetForm();

    this.showSuccessPopup = true;

    this.cdr.detectChanges();

  } else {

    console.error(
      'Backend did not return success=true',
      response
    );

    alert(
      response?.message ||
      'Registration could not be completed.'
    );

    this.cdr.detectChanges();
  }
},

      error: (error) => {

        console.error(
          'Registration API error:',
          error
        );

        this.showSuccessPopup = false;

        alert(
          error?.error?.message ||
          'Registration failed. Please try again.'
        );
      }

    });
}




  // ==============================
  // RESET FORM
  // ==============================

  resetForm(): void {

    this.registrationType = 'player';

    this.playerName = '';

    this.phoneNumber = '';

    this.category = '';

    this.tshirtSize = '';

    this.otherSize = '';

    this.tshirtName = '';

    this.playerPhoto = null;

    this.paymentScreenshot = null;
    this.paymentType = 'online';


    // Clear file inputs from browser
    const playerPhotoInput =
      document.getElementById(
        'playerPhoto'
      ) as HTMLInputElement;

    if (playerPhotoInput) {
      playerPhotoInput.value = '';
    }


    const paymentInput =
      document.getElementById(
        'paymentScreenshot'
      ) as HTMLInputElement;

    if (paymentInput) {
      paymentInput.value = '';
    }

  }


  // ==============================
  // CLOSE SUCCESS POPUP
  // ==============================

  closeSuccessPopup(): void {

    this.showSuccessPopup = false;
      this.router.navigate(['/form/registrations']);


  }

}
