import { LoadingScreen, Tabs } from "../../components/common";
import {
  TabMyProducts,
  TabCoordinator,
  TabBasicSettings,
} from "./../../components/pages/Profile/Tabs";

export default function ProfileScreen() {
  return (
    <div className="py-8">
      <LoadingScreen />
      <Tabs
        tabs={[
          {
            children: <TabBasicSettings />,
            key: "basic-settings",
            label: "Configurações básicas",
          },
          {
            children: <TabCoordinator />,
            key: "coordinator",
            label: "Coordenador",
          },
          {
            children: <TabMyProducts />,
            key: "my-produts",
            label: "Produtos",
          },
        ]}
      />
    </div>
  );
}
