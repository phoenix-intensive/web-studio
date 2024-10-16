import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ArticleCardComponent} from "./components/article-card/article-card.component";
import {RouterModule} from "@angular/router";
import {TruncateTextPipe} from "./pipes/truncate-text.pipe";
import { LoaderComponent } from './components/loader/loader.component';



@NgModule({
  declarations: [
    ArticleCardComponent,
    TruncateTextPipe,
    LoaderComponent
  ],


  imports: [
    CommonModule,
    RouterModule
  ],


  exports: [
    ArticleCardComponent,
    LoaderComponent
  ]
})
export class SharedModule { }
