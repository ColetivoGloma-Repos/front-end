import {
  IDistributionPoint,
  IQueryDistributionPoints,
} from "../../../interfaces/distribution-point/distriuition-points";

export interface IDistributionPointProvider {
  distributionPoints: IDistributionPoint[];
  isLoading: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onListDistributionPoints: (params?: IQueryDistributionPoints) => Promise<void>;
  saveOrSetDistributionPoint: (
    data: IDistributionPoint,
    distributionPointId?: string,
  ) => void;
}
