import { useNavigate } from "react-router-dom";
import { DistributionPointForm } from "../components/DistributionPointForm";
import { useDistributionPointProvider } from "../context";

export default function CreateDistributionPoint() {
  const navigation = useNavigate();

  const { saveOrSetDistributionPoint } = useDistributionPointProvider();

  const handleNavigation = () => {
    navigation(`/`);
  };

  return (
    <DistributionPointForm
      isEditMode={false}
      navigationCallback={handleNavigation}
      saveOrEditCallback={saveOrSetDistributionPoint}
    />
  );
}
