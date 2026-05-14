import React from "react";
import {
  IoShieldCheckmark,
  IoTime,
  IoSearch,
  IoPin,
  IoFilter,
  IoGift,
  IoListOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  cancelDonation,
  cancelRequestedProduct,
  confirmDeliveryDonation,
  confirmDeliveryRequestedProduct,
  listDistributionPoints,
  listDonations,
  listRequestedProducts,
  updateDonationCollectionType,
  listCoordinators,
  addCoordinator,
  removeCoordinator,
} from "../../../services/distribution-point";
import {
  DonationCollectionType,
  DonationStatus,
  IDistributionPoint,
  IListDonations,
  IListRequestedProducts,
  IQueryDonations,
} from "../../../interfaces/distribution-point";
import { toast } from "react-toastify";
import useParams from "../../../hooks/useParams";
import { Button, Input, Select } from "../../../components/common";
import { TableManageDonation } from "../components/TableManageDonation";
import { TableManageRequestedProducts } from "../components/TableManageRequestedProducts";
import { IQueryRequest } from "../../../interfaces/default";
import { ReturnButton } from "../components";
import { RequestedProductStatus } from "../../../interfaces/distribution-point/point-requested-product";
import { useDistributionPointProvider } from "../context";
import { DashboardTabType, IActionType } from "../interface/common";
import { ROUTES } from "../routes";

interface IQuery extends IQueryRequest {
  tab?: DashboardTabType;
  excludeStatus?: DonationStatus;
  distributionPointId?: string;
  status?: DonationStatus;
  activeOnly?: boolean;
  requestedStatus?: RequestedProductStatus;
}

const ACTION_REQUEST_TIMEOUT = 200;

export default function ManageDistributionPoint() {
  const navigation = useNavigate();
  const { ownerId } = useDistributionPointProvider();

  const [params, setParams] = useParams<IQuery>("donations", {
    tab: "donations",
    limit: "10",
    offset: "0",
  });

  const [data, setData] = React.useState<IListDonations>();
  const [requestedProducts, setRequestedProducts] =
    React.useState<IListRequestedProducts>();
  const [distributionPoints, setDistributionPoints] = React.useState<
    IDistributionPoint[]
  >([]);
  const [coordinators, setCoordinators] = React.useState<any[]>([]);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const dashboardTab = params.tab ?? "donations";

  const buildQuery = React.useCallback((p: IQuery): Omit<IQuery, "tab"> => {
    const query: IQuery = {
      ...p,
    };

    if (query.tab === "donations") {
      query.status = DonationStatus.ACTIVE;
      delete query.excludeStatus;
      delete query.activeOnly;
      delete query.requestedStatus;
    } else if (query.tab === "requests") {
      delete query.status;
      delete query.excludeStatus;
      query.activeOnly = true;

      if (
        query.requestedStatus !== RequestedProductStatus.OPEN &&
        query.requestedStatus !== RequestedProductStatus.FULL
      ) {
        delete query.requestedStatus;
      }
    } else {
      const hasHistoryStatus =
        query.status === DonationStatus.DELIVERED ||
        query.status === DonationStatus.CANCELED;

      delete query.activeOnly;
      delete query.requestedStatus;

      if (!hasHistoryStatus) {
        delete query.status;
        query.excludeStatus = DonationStatus.ACTIVE;
      } else {
        delete query.excludeStatus;
      }
    }

    delete query.tab;

    if (!query.q) delete query.q;
    if (!query.distributionPointId) delete query.distributionPointId;
    if (!query.activeOnly) delete query.activeOnly;
    if (!query.requestedStatus) delete query.requestedStatus;

    return query;
  }, []);

  React.useEffect(() => {
    if (!ownerId) return;

    const query = buildQuery(params);

    if (dashboardTab === "requests") {
      const status = query.requestedStatus;
      if (query.requestedStatus) delete query.requestedStatus;
      fetchRequestedProducts(status ? { ...query, status } : query);
      return;
    }

    fetchDonations(query);
  }, [params, ownerId, buildQuery, dashboardTab]);

  React.useEffect(() => {
    if (!ownerId) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await listDistributionPoints({
          ownerId,
          limit: "100",
        });
        if (!cancelled) setDistributionPoints(response.items);
      } catch (error) {
        console.error("Error fetching distribution points:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  const fetchDonations = async (_params?: any) => {
    const timer = setTimeout(() => setLoading(true), ACTION_REQUEST_TIMEOUT);
    try {
      const response = await listDonations(_params);
      setData(response);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(error.message || "Erro ao buscar doações. Tente novamente mais tarde.");
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const fetchRequestedProducts = async (_params?: any) => {
    const timer = setTimeout(() => setLoading(true), ACTION_REQUEST_TIMEOUT);
    try {
      const response = await listRequestedProducts(_params);
      setRequestedProducts(response);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao buscar solicitações de produtos. Tente novamente mais tarde.",
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const handleParams = (
    newParams: Partial<IQueryDonations & { excludeStatus?: DonationStatus } & IQuery>,
  ) => {
    setParams((prev) => {
      const rawOffset = parseInt((newParams as any).offset ?? prev.offset ?? "0", 10);
      const safeOffset = Math.max(0, rawOffset).toString();

      return {
        ...prev,
        ...(newParams as any),
        offset: safeOffset,
      };
    });
  };

  const handleTabChange = (newTab: DashboardTabType) => {
    setParams((prev) => ({
      ...prev,
      tab: newTab,
      offset: "0",
      status: newTab === "history" ? undefined : prev.status,
      excludeStatus: undefined,
      activeOnly: newTab === "requests" ? true : undefined,
      requestedStatus: undefined,
    }));
  };

  const handleConfirmDeliveryDonation = async (donationId: string) => {
    setRequesting(true);

    try {
      await confirmDeliveryDonation(donationId);

      const query = buildQuery(params);
      await fetchDonations(query);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message || "Erro ao confirmar a entrega. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelDonation = async (donationId: string) => {
    setRequesting(true);

    try {
      await cancelDonation(donationId);

      const query = buildQuery(params);
      await fetchDonations(query);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message || "Erro ao cancelar a doação. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleReviewRequestDonation = async (
    donationId: string,
    actionType: IActionType,
  ) => {
    if (actionType === "approve") {
      handleConfirmDeliveryDonation(donationId);
      return;
    }

    handleCancelDonation(donationId);
  };

  const handleCancelAllDonation = async (requestedProductId: string) => {
    setRequesting(true);

    try {
      await cancelRequestedProduct(requestedProductId);

      const query = buildQuery(params);
      await fetchRequestedProducts(query);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao cancelar solicitação do produto. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleConfirmDeliveryAllDonation = async (requestedProductId: string) => {
    setRequesting(true);

    try {
      await confirmDeliveryRequestedProduct(requestedProductId);

      const query = buildQuery(params);
      await fetchRequestedProducts(query);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao confirmar solicitação do produto. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleReviewRequestRequestedProduct = async (
    requestedProductId: string,
    actionType: IActionType,
  ) => {
    if (actionType === "approve") {
      await handleConfirmDeliveryAllDonation(requestedProductId);
      return;
    }

    await handleCancelAllDonation(requestedProductId);
  };

  const handleUpdateCollectionType = async (
    donationId: string,
    collectionType: DonationCollectionType,
  ) => {
    try {
      await updateDonationCollectionType(donationId, collectionType);
      const query = buildQuery(params);
      await fetchDonations(query);
    } catch (e) {
      const error = e as Error;
      toast.error(
        error.message || "Erro ao atualizar o tipo de coleta. Tente novamente.",
      );
    }
  };

  const fetchCoordinators = async (distributionPointId: string) => {
    const timer = setTimeout(() => setLoading(true), ACTION_REQUEST_TIMEOUT);
    try {
      const response = await listCoordinators(distributionPointId);
      setCoordinators(response.coordinators);
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message || "Erro ao buscar coordenadores. Tente novamente mais tarde.",
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const handleAddCoordinator = async (
    distributionPointId: string,
    coordinatorData: any,
  ) => {
    setRequesting(true);
    try {
      await addCoordinator(distributionPointId, coordinatorData);
      toast.success("Coordenador adicionado com sucesso!");
      await fetchCoordinators(distributionPointId);
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message || "Erro ao adicionar coordenador. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleRemoveCoordinator = async (
    distributionPointId: string,
    coordinatorId: string,
  ) => {
    setRequesting(true);
    try {
      await removeCoordinator(distributionPointId, coordinatorId);
      toast.success("Coordenador removido com sucesso!");
      await fetchCoordinators(distributionPointId);
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message || "Erro ao remover coordenador. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const navigateToList = () => {
    navigation(ROUTES.list);
  };

  const description = {
    donations: {
      title: (
        <>
          <IoGift className="text-primary" size={20} /> Fila de Aprovação de Doações
        </>
      ),
      description: "Aprove ou rejeite doações individuais feitas por usuários.",
    },
    requests: {
      title: (
        <>
          <IoListOutline className="text-primary" size={20} /> Gestão de Metas e
          Solicitações
        </>
      ),
      description:
        "Monitore o progresso, feche ou cancele pedidos de produtos feitos pelos pontos.",
    },
    history: {
      title: (
        <>
          <IoTime className="text-primary" size={20} /> Histórico Completo de Doações
        </>
      ),
      description: "Visualize todas as doações passadas (aprovadas e rejeitadas).",
    },
  };
  const descriptionStyle = description[dashboardTab];

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ReturnButton onClick={() => navigateToList()} />

          <h2 className="text-3xl font-bold text-base-content flex items-center gap-2">
            <IoShieldCheckmark className="text-primary" size={32} /> Gestão de Doações
          </h2>
        </div>

        <div className="join">
          <Button
            type="button"
            text={
              <>
                <IoGift size={16} /> Gerir Doações
              </>
            }
            className={`join-item btn-sm h-8 !rounded-tl-md !rounded-bl-md ${
              dashboardTab === "donations"
                ? "btn-primary text-white"
                : "btn-ghost bg-base-100 hover:bg-base-200"
            }`}
            onClick={() => handleTabChange("donations")}
          />

          <Button
            type="button"
            text={
              <>
                <IoListOutline size={16} /> Gerir Solicitações
              </>
            }
            className={`join-item btn-sm h-8 ${
              dashboardTab === "requests"
                ? "btn-primary text-white"
                : "btn-ghost bg-base-100 hover:bg-base-200"
            }`}
            onClick={() => handleTabChange("requests")}
          />

          <Button
            type="button"
            text={
              <>
                <IoTime size={16} /> Histórico
              </>
            }
            className={`join-item btn-sm h-8 !rounded-tr-md !rounded-br-md ${
              dashboardTab === "history"
                ? "btn-primary text-white"
                : "btn-ghost bg-base-100 hover:bg-base-200"
            }`}
            onClick={() => handleTabChange("history")}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-base-content/80 flex items-center gap-2">
          {descriptionStyle.title}
        </h3>
        <p className="text-xs text-base-content/60">{descriptionStyle.description}</p>
      </div>

      <div className="card rounded-2xl bg-base-100 shadow-sm mb-4 border border-base-200">
        <div className="card-body p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="form-control w-full md:w-1/3">
            <Input
              label="Buscar"
              type="text"
              placeholder="Nome do produto, doador ou email..."
              containerClassName=""
              className="input-sm w-full max-w-none h-9 !rounded-md"
              value={params?.q || ""}
              onChange={(e) =>
                handleParams({
                  q: (e.target as HTMLInputElement).value || undefined,
                  offset: "0",
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
              className="select-sm w-full max-w-none h-9 !rounded-md"
              value={params?.distributionPointId || ""}
              onChange={(e) =>
                handleParams({
                  distributionPointId: (e.target as HTMLSelectElement).value || undefined,
                  offset: "0",
                })
              }
              prefix={<IoPin size={16} />}
            />
          </div>

          {dashboardTab === "requests" && (
            <div className="form-control w-full md:w-1/4">
              <Select
                label="Status"
                options={[
                  { label: "Todos", value: "" },
                  { label: "Abertas", value: RequestedProductStatus.OPEN },
                  { label: "Meta atingida", value: RequestedProductStatus.FULL },
                ]}
                containerClassName=""
                className="select-sm w-full max-w-none h-9 !rounded-md"
                value={
                  params?.requestedStatus === RequestedProductStatus.OPEN ||
                  params?.requestedStatus === RequestedProductStatus.FULL
                    ? params.requestedStatus
                    : ""
                }
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  handleParams({
                    requestedStatus: value
                      ? (value as RequestedProductStatus)
                      : undefined,
                    offset: "0",
                  });
                }}
                prefix={<IoFilter size={16} />}
              />
            </div>
          )}

          {dashboardTab === "history" && (
            <div className="form-control w-full md:w-1/4">
              <Select
                label="Status"
                options={[
                  { label: "Todos", value: "" },
                  { label: "Entregues", value: DonationStatus.DELIVERED },
                  { label: "Canceladas", value: DonationStatus.CANCELED },
                ]}
                containerClassName=""
                className="select-sm w-full max-w-none h-9 !rounded-md"
                value={
                  params?.status === DonationStatus.DELIVERED ||
                  params?.status === DonationStatus.CANCELED
                    ? params.status
                    : ""
                }
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  handleParams({
                    status: value ? (value as DonationStatus) : undefined,
                    offset: "0",
                  });
                }}
                prefix={<IoFilter size={16} />}
              />
            </div>
          )}

          <div className="flex-1 text-right">
            <button
              type="button"
              className="btn btn-ghost btn-sm order-2 rounded-lg md:order-1"
              onClick={() =>
                setParams((prev) => ({
                  tab: prev.tab ?? dashboardTab,
                  limit: prev.limit ?? "10",
                  offset: "0",
                }))
              }
              disabled={
                !params?.q &&
                !params?.distributionPointId &&
                !(dashboardTab === "history" && params?.status) &&
                !(dashboardTab === "requests" && params?.requestedStatus)
              }
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {dashboardTab === "requests" ? (
        <TableManageRequestedProducts
          data={requestedProducts?.items || []}
          distributionPoints={distributionPoints}
          onParams={handleParams}
          onReviewRequest={handleReviewRequestRequestedProduct}
          params={{
            limit: Number(params.limit || "10"),
            offset: Number(params.offset || "0"),
            total: requestedProducts?.total || 0,
          }}
          isLoading={isLoading || !requestedProducts}
          requesting={requesting}
        />
      ) : (
        <TableManageDonation
          data={data?.items || []}
          distributionPoints={distributionPoints}
          onParams={handleParams}
          onReviewRequest={handleReviewRequestDonation}
          onUpdateCollectionType={handleUpdateCollectionType}
          params={{
            limit: Number(params.limit || "10"),
            offset: Number(params.offset || "0"),
            tab: params.tab || "donations",
            total: data?.total || 0,
          }}
          isLoading={isLoading || !data}
          requesting={requesting}
        />
      )}
    </div>
  );
}
