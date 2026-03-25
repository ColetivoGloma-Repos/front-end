import React from "react";
import { LoadingScreen, Tabs } from "../../../components/common";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { findDemandPointById } from "../../../services/demand-point.service";
import { IDemandPoint } from "../../../interfaces/demand-point";
import { DemandPointProvider } from "../../../components/pages/DemandPoint/context";
import { TabDemandPointDetails } from "../../../components/pages/DemandPoint/tabs/TabDemandPointsDetails";
import { TabDemandPointSettings } from "../../../components/pages/DemandPoint/tabs";

function DemandPointScreen() {
  const navigation = useNavigate();
  const { id = "" } = useParams();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [initialDemandPoint, setInitialDemandPoint] = React.useState<IDemandPoint>();

  const load = async () => {
    try {
      setLoading(true);
      const [respDemandPoint] = await Promise.all([findDemandPointById(id || "")]);
      setInitialDemandPoint(respDemandPoint);
    } catch (error) {
      console.error(error);
      toast.warn("Ponto de demanda não encontrado");
      navigation("/");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const tabs = [
    {
      key: "details",
      label: "Detalhes",
      children: <TabDemandPointDetails />,
    },
  ];

  if (initialDemandPoint) {
    tabs.push({
      key: "settings",
      label: "Atualizar",
      children: <TabDemandPointSettings />,
    });
  }

  if (!initialDemandPoint) return <></>;

  return (
    <DemandPointProvider initialDemandPoint={initialDemandPoint}>
      <LoadingScreen loading={loading} />
      <div className="py-8">
        <Tabs tabs={tabs} />
      </div>
    </DemandPointProvider>
  );
}

export default DemandPointScreen;
