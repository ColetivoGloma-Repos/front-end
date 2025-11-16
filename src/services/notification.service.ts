import { get } from "./cg-api.service";

export function getNotifications({ params, headers }: any = {}){
   return get(`/me`, { params, headers });
}