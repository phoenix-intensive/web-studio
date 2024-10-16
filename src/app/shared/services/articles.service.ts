import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {ArticlesType} from "../../../../types/articles.type";
import {ArticleType} from "../../../../types/articles-best.type";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {ArticleDetailType} from "../../../../types/article-detail.type";



@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }


  getBestArticles(): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/top');
  }


  getArticles(params: ActiveParamsType): Observable<ArticlesType> {
    return this.http.get<ArticlesType>(environment.api + 'articles', {
      params:params
      });
  }

  getArticle(url: string): Observable<ArticleDetailType> {
    return this.http.get<ArticleDetailType>(environment.api + 'articles/' + url);
  }

  getRelatedArticle(url: string): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/related/' + url);
  }

}
