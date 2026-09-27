import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormSubmissionRoutingModule }
  from './form-submission-routing-module';

import { SubmitForm }
  from '../submit-form/submit-form';

import { RegistrationList }
  from '../registration-list/registration-list';

import { Header }
  from '../header/header';
import { Dashboard } from '../dashboard/dashboard';
import { CategorySelection } from '../category-selection/category-selection';
import { CategoryList } from '../category-list/category-list';
import { Auction } from '../auction/auction';





@NgModule({

  declarations: [],

  imports: [
    CommonModule,
    FormSubmissionRoutingModule,
    SubmitForm,
    RegistrationList,
    Header,
    Dashboard,
    CategorySelection,
    CategoryList,
    Auction
    


  ],

  exports: [
    SubmitForm,
    Header,
    Dashboard,
    CategorySelection,
    CategoryList,
    Auction
  ]

})

export class FormSubmissionModule {}