import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DistributionPointForm } from "../components/DistributionPointForm";
import { useDistributionPointProvider } from "../context";
import { IDistributionPoint } from "../../../interfaces/distribution-point";
import { toast } from "react-toastify";
import { listOneDistributionPoint } from "../../../services/distribution-point";

export default function EditDistributionPoint() {
  const navigation = useNavigate();
  const { id = "" } = useParams();

  const { saveOrSetDistributionPoint } = useDistributionPointProvider();

  const [distributionPoint, setDistributionPoint] = React.useState<IDistributionPoint>();

  const handleNavigation = () => {
    navigation(`/distribution-point/${id}`);
  };

  const onPageLoad = async () => {
    try {
      const response = await listOneDistributionPoint(id);
      setDistributionPoint(response);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar ponto de distribuição.");
    }
  };

  React.useEffect(() => {
    onPageLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!distributionPoint) return null;

  return (
    <DistributionPointForm
      isEditMode={true}
      data={distributionPoint}
      navigationCallback={handleNavigation}
      saveOrEditCallback={saveOrSetDistributionPoint}
    />
  );
}
