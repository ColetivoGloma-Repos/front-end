import React from "react";
import { IDistributionPointProvider } from "./interface";
import {
  IDistributionPoint,
  IQueryDistributionPoints,
} from "../../../interfaces/distribution-point/distriuition-points";
import { listDistributionPoints } from "../../../services/distribution-point";
import { Outlet } from "react-router-dom";
import { useAuthProvider } from "../../../context/Auth";
import { toast } from "react-toastify";

const DistributionPointContext = React.createContext<IDistributionPointProvider>(
  {} as IDistributionPointProvider,
);

export function DistributionPointProvider() {
  const { currentUser } = useAuthProvider();

  const [distributionPoints, setDistributionPoints] = React.useState<
    IDistributionPoint[]
  >([]);
  const [total, setTotal] = React.useState<number>(0);
  const [pagination, setPagination] = React.useState({
    limit: 12,
    offset: 0,
  });

  const onListDistributionPoints = async (params?: IQueryDistributionPoints) => {
    try {
      const data = await listDistributionPoints(params);
      setTotal(data.total);
      setDistributionPoints((prev) => {
        if (params?.offset && Number(params.offset) > 0) {
          const newItems = data.items.filter(
            (item) => !prev.some((p) => p.id === item.id),
          );
          return [...prev, ...newItems];
        }
        return data.items;
      });
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(error.message || "Erro ao carregar pontos de distribuição.");
    }
  };

  const saveOrSetDistributionPoint = (
    distributionPoint: IDistributionPoint,
    distributionPointId?: string,
  ) => {
    setDistributionPoints((prevDistributionPoints) => {
      if (distributionPointId) {
        return prevDistributionPoints.map((dp) =>
          dp.id === distributionPointId ? distributionPoint : dp,
        );
      } else {
        return [distributionPoint, ...prevDistributionPoints];
      }
    });
  };

  const isLoggedIn = currentUser != null;
  const roles = currentUser?.roles || [];
  const isAdmin = roles.includes("admin");
  const isCoordinator = roles.includes("coordinator");
  const ownerId = currentUser?.id || "";

  return (
    <DistributionPointContext.Provider
      value={{
        distributionPoints,
        total,
        isLoggedIn,
        isAdmin,
        ownerId,
        isCoordinator,
        pagination,
        setPagination,
        onListDistributionPoints,
        saveOrSetDistributionPoint,
      }}
    >
      <Outlet />
    </DistributionPointContext.Provider>
  );
}

export const useDistributionPointProvider = () => {
  return React.useContext(DistributionPointContext);
};
