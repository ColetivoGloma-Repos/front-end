import React from "react";
import useInView from "../../../../hooks/useInView";
import { IDistributionPoint, IQueryDistributionPoints, DistributionPointStatus } from "../../../../interfaces/distribution-point/distriuition-points";
import { listDistributionPoints } from "../../../../services/distribution-point";
import { useAuthProvider } from "../../../../context/Auth";
import { Button, Loading, LoadingScreen } from "../../../common";
import { Search } from "../../../search";
import { IChangeStatus } from "../../../../interfaces/user";
import { changeStatusDistributionPoint } from "../../../../services/coordinators.service";
import { toast } from "react-toastify";
import { toastMessage } from "../../../../helpers/toast-message";
import { ModalStatusDistributionPoint } from "../.././../modals/Dashboard/ChangeStatusDistributionPoint";
import { formatAddress } from "../../../../utils";

const limit = 12;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "badge-warning" },
  APPROVED: { label: "Aprovado", color: "badge-success" },
  REJECTED: { label: "Rejeitado", color: "badge-error" },
};

export function DistributionPointsAdminScreen() {
  const { currentUser } = useAuthProvider();
  const { ref, inView } = useInView({ rootMargin: "-10px", threshold: 1 });

  const page = React.useRef<number>(0);
  const filter = React.useRef<IQueryDistributionPoints>({});

  const [distributionPoints, setDistributionPoints] = React.useState<IDistributionPoint[]>([]);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [infinitScroll, setInfinitScroll] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [selectedId, setSelectedId] = React.useState<string>("");

  const fetchPage = async (pageNum: number, params: IQueryDistributionPoints = {}) => {
    const resp = await listDistributionPoints({
      limit: String(limit),
      offset: String(pageNum * limit),
      ...params,
    });
    return resp;
  };

  const handleFilter = async (data: { search?: string }) => {
    page.current = 0;
    filter.current = { q: data.search };

    try {
      setRequesting(true);
      const resp = await fetchPage(0, filter.current);
      setDistributionPoints(resp.items);
      setInfinitScroll(resp.total > limit ? resp.items.length > 0 : false);
      page.current++;
    } catch {
      setInfinitScroll(false);
      toast.error(toastMessage.INTERNAL_SERVER_ERROR);
    } finally {
      setRequesting(false);
    }
  };

  const load = async () => {
    try {
      const resp = await fetchPage(page.current, filter.current);
      setDistributionPoints((prev) => [...prev, ...resp.items]);
      setInfinitScroll(resp.total > limit ? resp.items.length > 0 : false);
      page.current++;
    } catch {
      setInfinitScroll(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (inView) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const handleChangeStatus = async (data: IChangeStatus) => {
    if (!currentUser?.roles?.includes("admin")) {
      toast.error("Usuário sem autorização para realizar o evento.");
      return;
    }

    try {
      await changeStatusDistributionPoint(data);
      setDistributionPoints((prev) =>
        prev.map((dp) => (dp.id === data.id ? { ...dp, status: data.status as DistributionPointStatus } : dp)),
      );
      toast.success("Ponto de distribuição atualizado com sucesso.");
    } catch {
      toast.error(toastMessage.INTERNAL_SERVER_ERROR);
    } finally {
      setOpenModal(false);
    }
  };

  const getStatusBadge = (status: DistributionPointStatus) => {
    const info = STATUS_LABELS[status] || STATUS_LABELS.PENDING;
    return <span className={`badge badge-sm rounded-md ${info.color}`}>{info.label}</span>;
  };

  return (
    <div className="py-4">
      <LoadingScreen ref={ref} loading={loading} />

      <div className="my-5">
        <p className="font-semibold mb-2">Buscar</p>
        <div className="flex flex-col gap-4 md:flex-row">
          <Search
            className="gap-4 w-full"
            onFilter={handleFilter}
            options={[{ optionKey: "search", type: "input" }]}
          />
        </div>
      </div>

      {requesting ? (
        <div className="flex justify-center items-center h-[100px]">
          <Loading />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {distributionPoints.map((dp) => (
              <div
                key={dp.id}
                className="card card-compact bg-base-100 shadow-xl rounded-lg w-full"
              >
                <div className="card-body relative pb-16">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="card-title text-base">{dp.title}</h2>
                    {getStatusBadge(dp.status)}
                  </div>

                  {dp.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{dp.description}</p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">{formatAddress(dp.address)}</p>

                  <p className="text-sm">
                    <strong>Tel:</strong> {dp.phone}
                  </p>

                  <div className="absolute bottom-0 right-0 m-4">
                    <Button
                      className="bg-black text-white !rounded-md p-2 h-max border-none text-sm"
                      onClick={() => { setSelectedId(dp.id); setOpenModal(true); }}
                      text="Atualizar status"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!distributionPoints.length && !infinitScroll && (
            <div className="rounded-lg border border-solid border-black p-2 text-center my-5">
              <p className="text-gray-500">Nenhum ponto de distribuição encontrado.</p>
            </div>
          )}

          {infinitScroll && (
            <div className="flex justify-center items-center h-[100px]" ref={ref}>
              <Loading />
            </div>
          )}
        </>
      )}

      <ModalStatusDistributionPoint
        open={openModal}
        close={() => setOpenModal(false)}
        onSubmit={handleChangeStatus}
        id={selectedId}
      />
    </div>
  );
}
