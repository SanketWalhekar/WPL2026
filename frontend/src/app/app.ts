import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormSubmissionModule } from './FormSubmission/form-submission/form-submission-module';
import { Header } from './FormSubmission/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormSubmissionModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
