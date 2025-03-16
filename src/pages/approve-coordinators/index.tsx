import React from "react";
import { CardPrimary } from "../../components/cards/CardPrimary";
import {
  Button,
  LoadingScreen,
  Loading
} from "../../components/common";
import { useNavigate } from "react-router-dom";
import useInView from "../../hooks/useInView";
import { Search } from "../../components/search";
import { useAuthProvider } from "../../context/Auth";
import { toast } from "react-toastify";
import { toastMessage } from "../../helpers/toast-message";
import { ISearchDemandPoint } from "../../interfaces/demand-point";
import { IChangeStatus, ISearchCoordinator, IUserDash } from "../../interfaces/user";
import { changeStatusCoordinator, listAllCoordinator } from "../../services/coordinators.service";
import { ModalStatus } from "../../components/modals/Coordinators/ChangeStatus";

const limit = 12;


export default function AllCoordinatorsScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuthProvider();
 React.useEffect(() => {
  if (currentUser === undefined || currentUser === null) return;
  if (!currentUser || !currentUser.roles.includes('admin')) {
    navigate("/");
  }
}, [currentUser, navigate]);
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
  const [coordinators, setCoordinators] = React.useState<IUserDash[]>([]);

const handleFilter = async (data: ISearchCoordinator) => {
  
  page.current = 0;
  filter.current = data;

  try {
    setRequesting(true);

    
    const resp = await listAllCoordinator({
      limit: limit,
      offset: page.current * limit,
      search: data.search || "",
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
  if (!currentUser || !Array.isArray(currentUser.roles) || 
      !currentUser.roles.includes('admin')) {
      toast.error("Usuário sem autorização para realizar o evento.");
      return;
  }
    
  try {
    setRequestingCreate(true); 
    await changeStatusCoordinator(data);
    
    
    updateCoordinatorStatus(data.id, data.status);

    toast.success("Coordenador atualizado com sucesso.");
  } catch (error) {
    toast.error(toastMessage.INTERNAL_SERVER_ERROR);
  } finally {
    setOpenModal(false);
    setRequestingCreate(false);
  }
};


const updateCoordinatorStatus = (id: string, newStatus: string) => {
  setCoordinators((prevCoordinators) =>
    prevCoordinators.map((coordinator) =>
      coordinator.id === id
        ? { ...coordinator, status: newStatus } 
        : coordinator
    )
  );
};
  

  const convertStatus = (status: string): string => {
  const statusConvert = {
  waiting: "Esperando",
  approved: "Aprovado",
  rejected: "Rejeitado",
    } as const; 
    type StatusKey = keyof typeof statusConvert;
  return statusConvert[status as StatusKey] || statusConvert.waiting;
}

 const urlWhatsapp = "https://wa.me/55"
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
   
    setCoordinators((prevCoordinators) => [...prevCoordinators, ...respData]);
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
        <p className="font-semibold mb-2">Buscar</p>
        <div className="flex flex-col gap-4 md:flex-row">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coordinators.map((c, index) => {
              return (
                <CardPrimary key={`${c.id}-${index}`} image={c.url || ''} title={c.name}>
                  <div>                    
                      <p>
                      <strong>Telefone: </strong> 
                        {c.phone ? (
                          <a 
                            href={`${urlWhatsapp+c.phone}`} 
                            target="_blank"
                            className="text-green-500 hover:text-green-600 font-semibold" rel="noreferrer" 
                          >
                             {c.phone}
                          </a>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </p>              
                    <p>
                      <strong>E-mail:</strong> {c.email}
                    </p>
                    <p>
                      <strong>Status:</strong> {convertStatus(c.status)}
                    </p>                    
                  </div>
                  <div className="mt-4">
                  <Button
                    className="absolute bottom-0 right-0 m-4 bg-slate-200 !rounded-md p-2 h-max border-none"
                    onClick={() => openModalWithParams(c.id)}
                      text="Atualizar status"                      
                    />
                    </div>
                </CardPrimary>
              );
            })}
          </div>

          {!coordinators.length && !infinitScroll && (
            <div className="rounded-lg border border-solid border-black p-2 text-center my-5">
              <p className="B8 text-gray-1">Coordenadores não encontrados.</p>
            </div>
          )}

          {infinitScroll && (
            <div className="flex justify-center items-center h-[100px]" ref={ref}>
              <Loading />
            </div>
          )}
        </>
      )}

      <ModalStatus open={openModal} close={() => setOpenModal(false)} onSubmit={handleChangeStatusCoordinator} id={coordinatorId} />
    </div>
  );
}
