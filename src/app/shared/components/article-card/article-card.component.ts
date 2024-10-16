import {Component, Input, OnInit} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {ArticleType} from "../../../../../types/articles-best.type";


@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss'],
})
export class ArticleCardComponent implements OnInit {


  @Input() article!: ArticleType;
  serverStaticPath: string = environment.serverStaticPath;

  constructor() { }

  ngOnInit(): void {
  }

}
