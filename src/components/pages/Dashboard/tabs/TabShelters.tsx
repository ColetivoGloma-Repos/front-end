import useInView from "../../../../hooks/useInView";
import React from "react";
import { ISearchShelter, IShelter } from "../../../../interfaces/shelter";
import { listShelters } from "../../../../services/shelter.service";
import { useNavigate } from "react-router-dom";
import { useAuthProvider } from "../../../../context/Auth";
import { CardPrimary } from "../../../cards/CardPrimary";
import { Button, Loading, LoadingScreen, Tooltip } from "../../../common";
import { Search } from "../../../search";
import { ModalStatusShelter } from "../.././../modals/Dashboard/ChangeStatusShelter";
import { IChangeStatus } from "../../../../interfaces/user";
import { changeStatusShelter } from "../../../../services/coordinators.service";
import { toast } from "react-toastify";
import { toastMessage } from "../../../../helpers/toast-message";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  waiting: { label: "Aguardando", color: "badge-warning" },
  approved: { label: "Aprovado", color: "badge-success" },
  rejected: { label: "Rejeitado", color: "badge-error" },
};

export function ShelterScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuthProvider();
  const { ref, inView } = useInView({
    rootMargin: "-10px",
    threshold: 1,
  });
  const page = React.useRef<number>(0);
  const filter = React.useRef<ISearchShelter>({});
  const limit = 12;

  const [shelters, setShelters] = React.useState<IShelter[]>([]);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [infinitScroll, setInfinitScroll] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [selectedShelterId, setSelectedShelterId] = React.useState<string>("");

  const handleFilter = async (data: ISearchShelter) => {
    page.current = 0;
    filter.current = data;

    try {
      setRequesting(true);
      const resp = await listShelters({
        limit: limit,
        offset: page.current * limit,
        ...filter.current,
      });
      const respData = resp.data;
      const respTotal = resp.total;
      setShelters(respData);
      setInfinitScroll(respTotal > limit ? respData.length > 0 : false);
      page.current++;
    } catch (error) {
      console.error(error);
    } finally {
      setRequesting(false);
    }
  };

  const handleRedirect = (id: string) => {
    navigate(`/shelters/${id}`);
  };

  const openModalWithParams = (id: string) => {
    setSelectedShelterId(id);
    setOpenModal(true);
  };

  const handleChangeStatusShelter = async (data: IChangeStatus) => {
    if (!currentUser || !Array.isArray(currentUser.roles) || !currentUser.roles.includes("admin")) {
      toast.error("Usuário sem autorização para realizar o evento.");
      return;
    }

    try {
      await changeStatusShelter(data);
      setShelters((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, status: data.status } : s)),
      );
      toast.success("Abrigo atualizado com sucesso.");
    } catch {
      toast.error(toastMessage.INTERNAL_SERVER_ERROR);
    } finally {
      setOpenModal(false);
    }
  };

  const load = async () => {
    try {
      const currentPage = page.current;
      const resp = await listShelters({
        limit: limit,
        offset: currentPage * limit,
        ...filter.current,
      });
      const respData = resp.data;
      const respTotal = resp.total;
      setShelters((currentData) => [...currentData, ...respData]);
      setInfinitScroll(respTotal > limit ? respData.length > 0 : false);
      page.current++;
    } catch (error) {
      setInfinitScroll(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (inView) {
      load();
    }
  }, [inView]);

  const getStatusBadge = (status?: string) => {
    const info = STATUS_LABELS[status || "waiting"] || STATUS_LABELS.waiting;
    return (
      <span className={`badge badge-sm rounded-md ${info.color}`}>{info.label}</span>
    );
  };

  return (
    <div className="py-4">
      <LoadingScreen ref={ref} loading={loading} />

      <div className="my-5">
        <p className="font-semibold mb-2">Filtrar por</p>
        <div className="flex flex-col gap-4 md:flex-row">
          <Search
            className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full"
            onFilter={handleFilter}
            options={[
              {
                optionKey: "search",
                type: "input",
              },
            ]}
          />
        </div>
      </div>

      {requesting ? (
        <div className="flex justify-center items-center h-[100px]">
          <Loading />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shelters.map((shelter) => (
              <CardPrimary key={shelter.id} image="" title={shelter.name}>
                <div className="pb-10">
                  <div className="mb-2">{getStatusBadge(shelter.status)}</div>
                  <p>
                    <strong>Tel:</strong> {shelter.phone}
                  </p>
                  <Tooltip text={shelter.description}>
                    <p className="truncate text-sm text-gray-500">{shelter.description}</p>
                  </Tooltip>
                </div>
                <div className="absolute bottom-0 right-0 m-4 flex gap-2">
                  <Button
                    className="bg-slate-200 !rounded-md p-2 h-max border-none text-sm"
                    onClick={() => handleRedirect(shelter.id)}
                    text="Ver mais"
                  />
                  <Button
                    className="bg-black text-white !rounded-md p-2 h-max border-none text-sm"
                    onClick={() => openModalWithParams(shelter.id)}
                    text="Atualizar status"
                  />
                </div>
              </CardPrimary>
            ))}
          </div>

          {!shelters.length && !infinitScroll && (
            <div className="rounded-lg border border-solid border-black p-2 text-center my-5">
              <p className="B8 text-gray-1">Abrigos não encontrados</p>
            </div>
          )}

          {infinitScroll && (
            <div className="flex justify-center items-center h-[100px]" ref={ref}>
              <Loading />
            </div>
          )}
        </>
      )}

      <ModalStatusShelter
        open={openModal}
        close={() => setOpenModal(false)}
        onSubmit={handleChangeStatusShelter}
        id={selectedShelterId}
      />
    </div>
  );
}
