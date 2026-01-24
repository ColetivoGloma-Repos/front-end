import { get, patch, post, del } from "./cg-api.service";
import {
  ICreateDistributionPoint,
  IDistributionPoint,
  IListDistributionPoints,
  IQueryDistributionPoints,
  IListRequestedProducts,
  IQueryDonations,
  IListDonations,
  ICreateDonation,
  IDonation,
  IRequestedProduct,
  IUpdateRequestedProduct,
  ICreateRequestedProduct,
} from "../interfaces/distribution-point";

export function createDistributionPoint(data: ICreateDistributionPoint) {
  return post(`/distribution-point`, { data });
}

export function listDistributionPoints(
  params?: IQueryDistributionPoints,
): Promise<IListDistributionPoints> {
  return get(`/distribution-point`, { params });
}

export function updateDistributionPoint(id: string, data: ICreateDistributionPoint) {
  return patch(`/distribution-point/${id}`, { data });
}

export function listOneDistributionPoint(id: string): Promise<IDistributionPoint> {
  return get(`/distribution-point/${id}`);
}

export function listRequestedProducts(id: string): Promise<IListRequestedProducts> {
  return get(`/distribution-point/requested-products`, {
    params: { distributionPointId: id },
  });
}

export function listRequestedProduct(id: string): Promise<IRequestedProduct> {
  return get(`/distribution-point/requested-products/${id}`);
}

export function listDonations(params?: IQueryDonations): Promise<IListDonations> {
  return get(`/distribution-point/donation`, {
    params,
  });
}

export function createDonation(data: ICreateDonation): Promise<IDonation> {
  return post(`/distribution-point/donation`, {
    data,
  });
}

export function cancelAllDonation(requestedProductId: string): Promise<IDonation> {
  return del(`/distribution-point/requested-products/${requestedProductId}/donations`);
}

export function updateRequestedProduct(
  requestedProductId: string,
  data: IUpdateRequestedProduct,
): Promise<IRequestedProduct> {
  return patch(`/distribution-point/requested-products/${requestedProductId}`, { data });
}

export function deleteRequestedProduct(requestedProductId: string): Promise<void> {
  return del(`/distribution-point/requested-products/${requestedProductId}`);
}

export function createRequestedProduct(
  data: ICreateRequestedProduct,
): Promise<IRequestedProduct[]> {
  return post(`/distribution-point/requested-products`, { data });
}
