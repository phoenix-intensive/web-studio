import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { MainComponent } from './views/main/main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from "@angular/material/snack-bar";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {MatMenuModule} from "@angular/material/menu";
import {CarouselModule} from "ngx-owl-carousel-o";
import {SharedModule} from "./shared/shared.module";
import {AuthInterceptor} from "./core/auth/auth.interceptor";
import {MatDialogModule} from "@angular/material/dialog";
import {ReactiveFormsModule} from "@angular/forms";
import { BlogComponent } from './views/articles/blog/blog.component';
import { DetailComponent } from './views/articles/detail/detail.component';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import {HashLocationStrategy, LocationStrategy} from "@angular/common";


const maskConfig: Partial<IConfig> = {
  validation: false
};


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MainComponent,
    BlogComponent,
    DetailComponent,

  ],


  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    CarouselModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(maskConfig)
  ],


  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
