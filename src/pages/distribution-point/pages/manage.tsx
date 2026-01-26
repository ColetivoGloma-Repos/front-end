import React from "react";
import { IoMdArrowBack } from "react-icons/io";
import {
  IoShieldCheckmark,
  IoTime,
  IoRefresh,
  IoSearch,
  IoPin,
  IoFilter,
  IoCheckmark,
  IoClose,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  listDistributionPoints,
  listDonations,
} from "../../../services/distribution-point";
import {
  DonationStatus,
  IDistributionPoint,
  IListDonations,
  IQueryDonations,
} from "../../../interfaces/distribution-point";
import { useAuthProvider } from "../../../context/Auth";
import useParams from "../../../hooks/useParams";
import { Button, Input, Select } from "../../../components/common";

type DashboardTab = "pending" | "history";
type FlattenedDonation = {
  id: string;
  userId: string;
  requestedProductId: string;
  distributionPointId: string;
  quantity: number;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  distributionPointName: string;
  productName: string;
  unit: string;
  timestamp: number;
};

const ActionButton = ({
  type,
  ...props
}: {
  onClick: () => void;
  type: "approve" | "reject";
  disabled: boolean;
}) => {
  const baseClasses = "btn btn-sm btn-circle btn-ghost !rounded-full";
  const Icon = type === "reject" ? IoClose : IoCheckmark;

  const styleClasses =
    type === "reject"
      ? "text-error !bg-error/15 hover:!bg-error/30 !size-8"
      : "text-success !bg-success/15 hover:!bg-success/30 !size-8";

  return (
    <Button
      type="button"
      text={<Icon size={18} />}
      className={`${baseClasses} ${styleClasses}`}
      {...props}
    />
  );
};

export default function ManageDistributionPoint() {
  const navigation = useNavigate();
  const { currentUser } = useAuthProvider();

  const [params, setParams] = useParams<IQueryDonations & { tab?: DashboardTab }>(
    "donations",
    {
      tab: "pending",
      limit: "10",
      offset: "0",
    },
  );

  const [data, setData] = React.useState<IListDonations>();
  const [distributionPoints, setDistributionPoints] = React.useState<
    IDistributionPoint[]
  >([]);

  React.useEffect(() => {
    if (currentUser) {
      const query: IQueryDonations & { tab?: DashboardTab } = {
        ...params,
        status:
          params.tab === "pending" ? DonationStatus.ACTIVE : DonationStatus.DELIVERED,
      };

      delete query.tab;

      fetchDonations(query);
    }
  }, [params, currentUser]);

  React.useEffect(() => {
    let mounted = false;
    if (mounted) return;

    fetchDistributionPoints();

    return () => {
      mounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchDonations = async (_params?: IQueryDonations) => {
    try {
      const response = await listDonations(_params);
      setData(response);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const fetchDistributionPoints = async () => {
    try {
      const response = await listDistributionPoints({
        ownerId: currentUser?.id,
        limit: "100",
      });
      setDistributionPoints(response.items);
    } catch (error) {
      console.error("Error fetching distribution points:", error);
    }
  };

  const handleParams = (newParams: Partial<IQueryDonations>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const handleTabChange = (newTab: DashboardTab) => {
    setParams({
      ...params,
      tab: newTab,
      offset: "0",
    });
  };

  const navigateToList = () => {
    navigation(`/`);
  };

  const dashboardTab = params.tab ?? "pending";
  const limit = Number(params.limit ?? 10);
  const offset = Number(params.offset ?? 0);
  const currentPage = data?.page ?? 1;
  const totalItems = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const filteredDonations: FlattenedDonation[] = React.useMemo(() => {
    const donations = data?.items ?? [];

    return donations.map((donation) => {
      const distributionPoint = distributionPoints.find(
        (p) => p.id === donation.distributionPointId,
      );
      const distributionPointName = distributionPoint?.title ?? "Ponto não informado";

      const product = donation.requestedProduct.product;
      const productName = product?.name ?? "Produto não informado";
      const unit = product?.unit ?? "un";

      const ts = new Date(donation.createdAt).getTime();

      return {
        id: donation.id,
        userId: donation.userId,
        requestedProductId: donation.requestedProductId,
        distributionPointId: donation.distributionPointId,
        quantity: donation.quantity,
        status: donation.status,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt,
        userName: donation.user?.name ?? "Anônimo",
        userEmail: donation.user?.email ?? "Sem email",
        distributionPointName,
        productName,
        unit,
        timestamp: ts,
      };
    });
  }, [data, distributionPoints]);

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateToList}
            className="btn rounded-lg btn-ghost btn-sm pl-0"
          >
            <IoMdArrowBack size={20} className="mx-2" /> Voltar
          </button>
          <h2 className="text-3xl font-bold text-base-content flex items-center gap-2">
            <IoShieldCheckmark className="text-primary" size={32} /> Gestão de Doações
          </h2>
        </div>

        <div className="join rounded-md">
          <button
            className={`join-item btn btn-sm ${
              dashboardTab === "pending"
                ? "btn-primary text-white"
                : "btn-ghost bg-base-100"
            }`}
            onClick={() => handleTabChange("pending")}
          >
            <IoTime size={16} /> Pendentes
          </button>

          <button
            className={`join-item btn btn-sm ${
              dashboardTab === "history"
                ? "btn-primary text-white"
                : "btn-ghost bg-base-100"
            }`}
            onClick={() => handleTabChange("history")}
          >
            <IoRefresh size={16} /> Histórico
          </button>
        </div>
      </div>

      <div className="card rounded-2xl bg-base-100 shadow-sm mb-4 border border-base-200">
        <div className="card-body p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="form-control w-full md:w-1/3">
            <Input
              label="Buscar"
              type="text"
              placeholder="Nome do produto, doador ou email..."
              containerClassName=""
              className="input-sm w-full pl-9 max-w-none h-9 !rounded-md"
              value={params?.q || ""}
              onChange={(e) =>
                handleParams({
                  q: (e.target as HTMLInputElement).value || undefined,
                })
              }
              prefix={<IoSearch size={16} />}
            />
          </div>

          <div className="form-control w-full md:w-1/4">
            <Select
              label="Ponto"
              options={[
                { label: "Todos os pontos", value: "" },
                ...distributionPoints.map((p) => ({
                  label: p.title,
                  value: p.id,
                })),
              ]}
              containerClassName=""
              className="select-sm w-full pl-9 max-w-none h-9 !rounded-md"
              value={params?.distributionPointId || ""}
              onChange={(e) =>
                handleParams({
                  distributionPointId: (e.target as HTMLSelectElement).value || undefined,
                })
              }
              prefix={<IoPin size={16} />}
            />
          </div>

          <div className="flex-1 text-right">
            <button
              onClick={() => setParams({ tab: dashboardTab })}
              className="btn btn-ghost btn-xs opacity-50 hover:opacity-100"
              disabled={!params?.q && !params?.distributionPointId}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-2xl bg-base-100 shadow-xl border-t-4 border-primary overflow-hidden">
        <div className="card-body p-0">
          {filteredDonations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-50">
              <IoFilter size={48} className="mb-4 text-base-content/30" />
              <p className="font-medium">
                Nenhuma doação encontrada com os filtros atuais.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto min-h-[400px]">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/50 text-base-content/70">
                      <th>Doador</th>
                      <th>Produto / Ponto</th>
                      <th>Quantidade</th>
                      <th>Data</th>
                      <th className="text-center">Status</th>
                      {dashboardTab === "pending" && (
                        <th className="text-right">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((d) => (
                      <tr key={d.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-8">
                                <span className="text-xs">
                                  {d.userName?.charAt(0) || "A"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-sm">
                                {d.userName || "Anônimo"}
                              </div>
                              <div className="text-xs opacity-50">
                                {d.userEmail || "Sem email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="font-medium text-sm">{d.productName}</div>
                          <div
                            className="text-xs opacity-50 truncate max-w-[200px]"
                            title={d.distributionPointName}
                          >
                            {d.distributionPointName}
                          </div>
                        </td>

                        <td className="font-mono text-sm">
                          {d.quantity}{" "}
                          <span className="text-xs opacity-70">{d.unit}</span>
                        </td>

                        <td className="text-sm opacity-70">
                          {new Date(d.timestamp).toLocaleDateString()}
                          <br />
                          <span className="text-xs opacity-50">
                            {new Date(d.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td className="text-center">
                          {d.status === DonationStatus.ACTIVE && (
                            <div className="badge badge-warning gap-1">
                              <IoTime size={10} /> Pendente
                            </div>
                          )}
                          {d.status === DonationStatus.DELIVERED && (
                            <div className="badge badge-success text-white gap-1">
                              <IoCheckmark size={10} /> Entregue
                            </div>
                          )}
                          {d.status === DonationStatus.CANCELED && (
                            <div className="badge badge-error text-white gap-1">
                              <IoClose size={10} /> Cancelado
                            </div>
                          )}
                        </td>

                        {dashboardTab === "pending" && (
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                onClick={() => {}}
                                type="reject"
                                disabled={false}
                              />
                              <ActionButton
                                onClick={() => {}}
                                type="approve"
                                disabled={false}
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-base-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100">
                <div className="text-sm text-base-content/60">
                  Mostrando{" "}
                  <span className="font-medium text-base-content">{offset + 1}</span> -{" "}
                  <span className="font-medium text-base-content">
                    {Math.min(offset + limit, totalItems)}
                  </span>{" "}
                  de <span className="font-medium text-base-content">{totalItems}</span>{" "}
                  resultados
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-base-content/60">
                      Linhas por página:
                    </span>
                    <Select
                      options={[
                        { label: "5", value: "5" },
                        { label: "10", value: "10" },
                        { label: "20", value: "20" },
                        { label: "50", value: "50" },
                      ]}
                      className="select-xs h-8 max-w-none !rounded-md"
                      value={String(limit)}
                      onChange={(e) =>
                        handleParams({
                          limit: (e.target as HTMLSelectElement).value,
                          offset: "0",
                        })
                      }
                    />
                  </div>

                  <div className="join rounded-md">
                    <button
                      className="join-item btn btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => handleParams({ offset: String(offset - limit) })}
                    >
                      <IoChevronBack size={16} />
                    </button>
                    <button className="join-item btn btn-sm no-animation pointer-events-none">
                      Página {currentPage} de {totalPages}
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handleParams({ offset: String(offset + limit) })}
                    >
                      <IoChevronForward size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
