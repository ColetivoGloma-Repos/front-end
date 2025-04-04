import { ISearchDemandPoint } from "../interfaces/demand-point";
import { IChangeStatus } from "../interfaces/user";
import { get, patch } from "./cg-api.service";

export async function listAllCoordinator(params: ISearchDemandPoint) {
    return get(`/dashboard/coordinators`,  { params })
}

export async function changeStatusCoordinator(data: IChangeStatus) {
    return patch(`/dashboard/coordinators`, { data })
}