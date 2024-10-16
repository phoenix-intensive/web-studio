import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import {ReactiveFormsModule} from "@angular/forms";
import { UserAgreementComponent } from './user-agreement/user-agreement.component';
import {SharedModule} from "../../shared/shared.module";


@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    UserAgreementComponent
  ],


  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserRoutingModule,
    SharedModule
  ]
})
export class UserModule { }
