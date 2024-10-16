import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ServicesType} from "../../../../types/services.type";

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpClient) { }



  // Метод для получения информации об услугах
  getServices(): Observable<ServicesType[]> {
    return this.http.get<ServicesType[]>(environment.api + 'categories');
  }
}
