import { get } from "./cg-api.service";

export function getNotifications({ params, headers }: any = {}){
   return get(`/notifications/me`, { params, headers });
}