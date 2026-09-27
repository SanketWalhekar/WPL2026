import { Routes } from '@angular/router';
import { Login } from './FormSubmission/login/login';

export const routes: Routes = [

  {
    path: 'form',
    loadChildren: () =>
      import('./FormSubmission/form-submission/form-submission-module')
        .then(m => m.FormSubmissionModule)
  },

  {
    path: '',
    redirectTo: 'form',
    pathMatch: 'full'
  },
{
    path:'login',
    component:Login
  },
  {
    path: '**',
    redirectTo: 'form'
  },
  

];