import { useNavigate } from "react-router-dom";
import { DistributionPointForm } from "../components/DistributionPointForm";
import { useDistributionPointProvider } from "../context";
import { ROUTES } from "../routes";

export default function CreateDistributionPoint() {
  const navigation = useNavigate();

  const { saveOrSetDistributionPoint } = useDistributionPointProvider();

  const handleNavigation = () => {
    navigation(ROUTES.list);
  };

  return (
    <DistributionPointForm
      isEditMode={false}
      navigationCallback={handleNavigation}
      saveOrEditCallback={saveOrSetDistributionPoint}
    />
  );
}
