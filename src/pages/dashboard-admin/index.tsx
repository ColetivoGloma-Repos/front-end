import { Tabs } from "../../components/common"
import { ShelterScreen } from "../../components/pages/Dashboard/tabs/TabShelters"
import { DistributionPointsAdminScreen } from "../../components/pages/Dashboard/tabs/TabDistributionPoints"
import AllCoordinatorsScreen from "../approve-coordinators"

export function DashboardAdminScreen() {

    const tabs = [
        {
            key: "coordinators",
            label: "Coordenadores",
            children: <AllCoordinatorsScreen />,
        },
        {
            key: "shelters",
            label: "Abrigos",
            children: <ShelterScreen />,
        },
        {
            key: "distribution-points",
            label: "Pontos de Distribuição",
            children: <DistributionPointsAdminScreen />,
        },
    ]

    return (
        <div className="py-8">
            <div className="mb-8 border-b border-base-200 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-black rounded-lg p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                        <p className="text-sm text-gray-500">Gerencie coordenadores, abrigos e pontos de distribuição da plataforma</p>
                    </div>
                </div>
            </div>

            <Tabs tabs={tabs} />
        </div>
    )
}
