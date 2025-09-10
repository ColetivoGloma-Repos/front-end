import { ISearchDemandPoint } from "../interfaces/demand-point";
import { IChangeStatus } from "../interfaces/user";
import { get, patch } from "./cg-api.service";

export async function listAllCoordinator(params: ISearchDemandPoint) {
    return get(`/dashboard/coordinators`,  { params })
}

export async function changeStatusCoordinator(data: IChangeStatus) {
    return patch(`/dashboard/coordinators`, { data })
}

export async function listInitiative(params: ISearchDemandPoint) {
    return get(`/dashboard/admins-initiative`,  { params })
}

export async function changeStatusToAdminInitiative(data: IChangeStatus) {
    return patch(`/dashboard/admin-initiative`, { data })
}