import { Tabs } from "../../components/common"
import { ShelterScreen } from "../../components/pages/Dashboard/tabs/TabShelters"
import AllCoordinatorsWantToBecomeAdminInitiativeScreen from "../approve-admin-initiative"
import AllCoordinatorsScreen from "../approve-coordinators"

export function  DashboardAdminScreen() {

    const tabs = [
         {
              key: "coordinators",
              label: "Cordenadores",
              children: <AllCoordinatorsScreen />,
          }, 
          {
              key: "admin-initiative",
              label: "Administradores de iniciativa",
              children: <AllCoordinatorsWantToBecomeAdminInitiativeScreen />,
          }, 
          {
              key: "shelters",
              label: "Abrigos",
              children: <ShelterScreen />,
          },         
    ]
return (
   <div className="py-8">
       <Tabs tabs={tabs} />
   </div>
)
}