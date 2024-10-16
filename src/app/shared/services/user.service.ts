import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {UserInfoType} from "../../../../types/user-info.type";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }



  // Метод для получения информации о пользователе
  getUserInfo(): Observable<UserInfoType | DefaultResponseType> {
    return this.http.get<UserInfoType | DefaultResponseType>(environment.api + 'users');
  }
}


