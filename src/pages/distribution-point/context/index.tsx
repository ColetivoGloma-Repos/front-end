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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error>();
  // const [pagination, setPagination] = React.useState({
  //   limit: 10,
  //   offset: 0,
  //   params: {},
  // });

  const onListDistributionPoints = async (params?: IQueryDistributionPoints) => {
    setIsLoading(true);

    try {
      const data = await listDistributionPoints(params);
      setDistributionPoints(data.items);
      // setPagination({
      //   limit: data.limit,
      //   offset: data.page * data.limit,
      //   params: params || {},
      // });
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(error.message || "Erro ao carregar pontos de distribuição.");
    } finally {
      setIsLoading(false);
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

  return (
    <DistributionPointContext.Provider
      value={{
        error,
        distributionPoints,
        isLoading,
        isAdmin: true,
        isLoggedIn: currentUser != null,
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
