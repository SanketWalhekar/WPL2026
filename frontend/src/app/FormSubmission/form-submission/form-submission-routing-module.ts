import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Dashboard } from '../dashboard/dashboard';
import { SubmitForm } from '../submit-form/submit-form';
import { RegistrationList } from '../registration-list/registration-list';
import { CategorySelection } from '../category-selection/category-selection';
import { CategoryList } from '../category-list/category-list';
import { Auction } from '../auction/auction';
import { authGuard } from '../auth.guard';



const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: '',
        component: SubmitForm
      },
      {
        path: 'registrations',
        component: RegistrationList
      },
      {
  path: 'category-selection',
      canActivate: [authGuard],
  component: CategorySelection
},
{
  path:'category-list',
      canActivate: [authGuard],
  component:CategoryList
},
{
  path:'auction',
      canActivate: [authGuard],
  component:Auction
}
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class FormSubmissionRoutingModule {}