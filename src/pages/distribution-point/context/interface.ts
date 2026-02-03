import {
  IDistributionPoint,
  IQueryDistributionPoints,
} from "../../../interfaces/distribution-point/distriuition-points";

export interface IDistributionPointProvider {
  distributionPoints: IDistributionPoint[];
  total: number;
  isLoading: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  ownerId: string;
  isLoggedIn: boolean;
  pagination: { limit: number; offset: number };
  setPagination: React.Dispatch<React.SetStateAction<{ limit: number; offset: number }>>;
  onListDistributionPoints: (params?: IQueryDistributionPoints) => Promise<void>;
  saveOrSetDistributionPoint: (
    data: IDistributionPoint,
    distributionPointId?: string,
  ) => void;
}
