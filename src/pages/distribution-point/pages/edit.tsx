import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DistributionPointForm } from "../components/DistributionPointForm";
import { useDistributionPointProvider } from "../context";
import { IDistributionPoint } from "../../../interfaces/distribution-point";
import { toast } from "react-toastify";
import { listOneDistributionPoint } from "../../../services/distribution-point";
import { FormSkeleton } from "../components";

interface IState {
  distributionPoint?: IDistributionPoint;
  isLoading: boolean;
}

export default function EditDistributionPoint() {
  const navigation = useNavigate();
  const { id = "" } = useParams();

  const { saveOrSetDistributionPoint, isCoordinator, ownerId } =
    useDistributionPointProvider();

  const [{ isLoading, distributionPoint: _distributionPoint }, setState] =
    React.useState<IState>({
      distributionPoint: undefined,
      isLoading: true,
    });

  const handleNavigation = () => {
    navigation(`/distribution-point/${id}`);
  };

  const onPageLoad = async () => {
    try {
      const distributionPoint = await listOneDistributionPoint(id);
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          distributionPoint,
          isLoading: false,
        }));
      }, 200);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(error.message || "Erro ao carregar ponto de distribuição.");
    }
  };

  React.useEffect(() => {
    let mounted = false;
    if (mounted) return;

    onPageLoad();

    return () => {
      mounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <FormSkeleton />;
  }

  const distributionPoint = _distributionPoint!;

  const isOnwer = isCoordinator && distributionPoint.ownerId === ownerId;

  if (!isOnwer) return null;

  return (
    <DistributionPointForm
      isEditMode={true}
      data={distributionPoint}
      navigationCallback={handleNavigation}
      saveOrEditCallback={saveOrSetDistributionPoint}
    />
  );
}
