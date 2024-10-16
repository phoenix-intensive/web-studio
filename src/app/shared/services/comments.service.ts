import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommentsType} from "../../../../types/comments.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AddCommentType} from "../../../../types/add-comment.type";
import {UserReactionType} from "../../../../types/user-reaction.type";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) { }



  getComments(articleId: string, offset: number, limit: number = 10): Observable<CommentsType> {
    const params = {
      offset: offset.toString(),
      article: articleId,
      limit: limit.toString()
    };
    return this.http.get<CommentsType>(`${environment.api}comments`, { params });
  }


  addComment(params: AddCommentType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(`${environment.api}comments`, params);
  }


  addLike(comment: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(`${environment.api}comments/${comment}/apply-action`,
      {
        action: "like"
      });
  }

  addDislike(comment: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(`${environment.api}comments/${comment}/apply-action`,
      {
        action: "dislike"
      });
  }

  addViolate(commentId: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(`${environment.api}comments/${commentId}/apply-action`,
      {
        action: "violate"
      });
  }


  getUserReactionComment(commentId: string): Observable<UserReactionType[] | DefaultResponseType> {
    return this.http.get<UserReactionType[] | DefaultResponseType>(`${environment.api}comments/${commentId}/actions`);
  }

}
