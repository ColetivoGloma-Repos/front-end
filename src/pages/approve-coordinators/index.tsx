import React from "react";
import { CardPrimary } from "../../components/cards/CardPrimary";
import {
  Button,
  LoadingScreen,
  Loading,
  Skeleton,
  Tooltip,
} from "../../components/common";
import { useNavigate } from "react-router-dom";
import useInView from "../../hooks/useInView";
import { Search } from "../../components/search";
import { useAuthProvider } from "../../context/Auth";
import { toast } from "react-toastify";
import { toastMessage } from "../../helpers/toast-message";
import { IDemandPointCreate, ISearchDemandPoint } from "../../interfaces/demand-point";
import { ModalDemandPoint } from "../../components/modals/DemandPoint";
import { createDemandPoint } from "../../services/demand-point.service";
import { IChangeStatus, ISearchCoordinator, IUserDash } from "../../interfaces/user";
import { changeStatusCoordinator, listAllCoordinator } from "../../services/coordinators.service";
import { ModalStatus } from "../../components/modals/Coordinators/ChangeStatus";

const limit = 12;

export default function AllCoordinatorsScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuthProvider();
  const { ref, inView } = useInView({
    rootMargin: "-10px",
    threshold: 1,
  });

  const page = React.useRef<number>(0);
  const filter = React.useRef<ISearchDemandPoint>({});

  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [requestingCreate, setRequestingCreate] = React.useState<boolean>(false);
  const [infinitScroll, setInfinitScroll] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
   const [coordinatorId, setCoordinatorId] = React.useState<string>("");
  const [coordinators, setCoordinators] = React.useState<
    IUserDash[]
  >([]);

  const handleFilter = async (data: ISearchCoordinator) => {
    page.current = 0;
    filter.current = data;

    try {
      setRequesting(true);

      const resp = await listAllCoordinator({
        limit: limit,
        offset: page.current * limit,
        ...filter.current,
      });
      const respData = resp.data;
      const respTotal = resp.total;

      setCoordinators(respData);
      setInfinitScroll(respTotal > limit ? respData.length > 0 : false);
      page.current++;
    } catch (error) {
      setInfinitScroll(false);
      toast.error(toastMessage.INTERNAL_SERVER_ERROR);
    } finally {
      setRequesting(false);
    }
  };

  const handleChangeStatusCoordinator = async (data: IChangeStatus) => {
    
    try {
     
      setRequestingCreate(true);
  
      const respChangeStatus = await changeStatusCoordinator(data)

      setCoordinators((currentCoordinators) => {
          return [respChangeStatus, ...currentCoordinators];
      });      
      toast.success("Coordenador atualizado com sucesso.");
      
    } catch (error) {      
      toast.error(toastMessage.INTERNAL_SERVER_ERROR);
    } finally {      
      setOpenModal(false)
      setRequestingCreate(false)
    }
  }

  const openModalWithParams = (id: string) => {
  setCoordinatorId(id);
  setOpenModal(true);
  };

  const load = async () => {
    try {
      const currentPage = page.current;

      const resp = await listAllCoordinator({
        limit: limit,
        offset: page.current * limit,
        ...filter.current,
      });
      const respData = resp.data;
      const respTotal = resp.total;
      setCoordinators((currentData) => [...currentData, ...respData]);
      setInfinitScroll(respTotal > limit ? respData.length > 0 : false);
      page.current++;
    } catch (error) {
      setInfinitScroll(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (inView) {
      load();
    }
  }, [inView]);

  return (
    <div className="py-8">
      <LoadingScreen ref={ref} loading={loading} />

      <div className="my-5">
        <p className="font-semibold mb-2">Filtrar por</p>
        <div
          className={`
            flex flex-col gap-4 md:flex-row
          `}
        >
          <Search
            className="gap-4 w-full"
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
          <div
            className={`
              grid grid-cols-1 gap-3
              sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
            `}
          >
            {requestingCreate && (
              <div
                className={`
                  card card-compact bg-base-100 shadow-xl
                  rounded-lg w-full overflow-hidden
                `}
              >
                <Skeleton className="w-full h-44 rounded-none" />
                <div className={`card-body`}>
                  <Skeleton className="card-title w-32 h-6" />
                  <Skeleton className="card-title w-28 h-4" />
                </div>
              </div>
            )}

            {coordinators.map((c, index) => {
               return (
                <CardPrimary
                  key={`${c.id}-${index}`}
                  image=""
                  title={c.name}
                >
                  <div>
                    <Tooltip text={'telefone'}>
                    <p>
                      <strong>Telefone:</strong> {c.phone || '(00) 99999-9999'}
                     </p>
                    </Tooltip>
                    <Tooltip text={'E-mail'}>
                      <p><strong>E-mail</strong> {c.email}</p>
                     </Tooltip>
                     <Tooltip text={'E-mail'}>
                      <p><strong>Status</strong> {c.status}</p>
                     </Tooltip>
                     <br />
                     <br />
                     <br />
                  </div>

                  <Button
                    className={`
                      absolute bottom-0 right-0
                      m-4 bg-slate-200 !rounded-md p-2 h-max
                      border-none
                    `}
                    onClick={() => openModalWithParams(c.id)}
                    text="Atualizar status"
                  />
                </CardPrimary>
              );
            })}
          </div>

          {!coordinators ||
            (!coordinators.length && !infinitScroll && (
              <div className="rounded-lg border border-solid border-black p-2 text-center my-5">
                <p className="B8 text-gray-1">Coordernadores não encontrados.</p>
              </div>
            ))}

          {infinitScroll && (
            <div className="flex justify-center items-center h-[100px]" ref={ref}>
              <Loading />
            </div>
          )}
        </>
      )}

      <ModalStatus
        open={openModal}
        close={() => setOpenModal(false)}
        onSubmit={handleChangeStatusCoordinator}
        id={coordinatorId}
      />
    </div>
  );
}
