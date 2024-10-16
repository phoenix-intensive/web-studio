import {ServiceType} from "./service.type";

export type OrderType = {
  service?: string,
  name: string,
  phone: string,
  type: ServiceType;
}
