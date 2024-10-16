import { Injectable } from '@angular/core';
import {OrderType} from "../../../../types/order.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }


  createOrder(params: OrderType): Observable<OrderType | DefaultResponseType> {
    return this.http.post<OrderType | DefaultResponseType>(environment.api + 'requests', params);
  }
}
