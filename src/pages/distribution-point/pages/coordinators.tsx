import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthProvider } from "../../../context/Auth";
import { useDistributionPointProvider } from "../context";
import { Alert, Button } from "../../../components/common";
import { IoWarningOutline } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import { ModalConfirmAction } from "../../../components/modals";
import { toast } from "react-toastify";
import {
  listCoordinators,
  addCoordinator,
  removeCoordinator,
} from "../../../services/distribution-point";
import { listOneDistributionPoint } from "../../../services/distribution-point";
import { IDistributionPoint } from "../../../interfaces/distribution-point/distriuition-points";
import { ReturnButton } from "../components";
import { ROUTES } from "../routes";

interface ICoordinator {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  hasVehicle?: boolean | null;
}

export default function CoordinatorsPage() {
  const navigation = useNavigate();
  const { id = "" } = useParams();
  const { currentUser } = useAuthProvider();
  const { isAdmin, isCoordinator } = useDistributionPointProvider();

  const [distributionPoint, setDistributionPoint] =
    React.useState<IDistributionPoint>();
  const [coordinators, setCoordinators] = React.useState<ICoordinator[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [requesting, setRequesting] = React.useState(false);
  const [openModalRemove, setOpenModalRemove] = React.useState(false);
  const [selectedCoordinator, setSelectedCoordinator] =
    React.useState<ICoordinator>();

  React.useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const point = await listOneDistributionPoint(id || "");
      setDistributionPoint(point);

      const response = await listCoordinators(id || "");
      const coordsWithVehicle = (response.coordinators || []).map((coord) => ({
        id: coord.id,
        name: coord.name,
        email: coord.email,
        phone: coord.phone,
        hasVehicle: coord.owner?.hasVehicle,
      }));

      if (point.owner) {
        const ownerCoord: ICoordinator = {
          id: point.owner.id,
          name: point.owner.name,
          email: point.owner.email,
          phone: point.owner.phone,
          hasVehicle: point.owner.hasVehicle,
        };
        setCoordinators([ownerCoord, ...coordsWithVehicle]);
      } else {
        setCoordinators(coordsWithVehicle);
      }
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message ||
          "Erro ao carregar coordenadores. Tente novamente mais tarde."
      );
      navigation(ROUTES.detail(id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoordinator = async () => {
    if (!selectedCoordinator || !distributionPoint) return;

    setRequesting(true);
    try {
      await removeCoordinator(distributionPoint.id, selectedCoordinator.id);
      toast.success("Coordenador removido com sucesso!");
      setOpenModalRemove(false);
      await loadData();
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message ||
          "Erro ao remover coordenador. Tente novamente mais tarde."
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleSubscribe = async () => {
    if (!distributionPoint || !currentUser) return;

    setRequesting(true);
    try {
      await addCoordinator(distributionPoint.id, {});
      toast.success("Você se inscreveu como coordenador!");
      await loadData();
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message ||
          "Erro ao se inscrever. Tente novamente mais tarde."
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!distributionPoint || !currentUser) return;

    setRequesting(true);
    try {
      await removeCoordinator(distributionPoint.id, currentUser.id);
      toast.success("Você se desinscreveu como coordenador!");
      await loadData();
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error(
        error.message ||
          "Erro ao se desinscrever. Tente novamente mais tarde."
      );
    } finally {
      setRequesting(false);
    }
  };

  const isOwner = distributionPoint && currentUser?.id === distributionPoint.ownerId;
  const isCurrentUserCoordinator = coordinators.some(
    (c) => c.id === currentUser?.id
  );

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="loading loading-spinner loading-lg mx-auto" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <ReturnButton onClick={() => navigation(ROUTES.detail(id))} />
        <h1 className="text-3xl font-bold text-base-content">
          Coordenadores - {distributionPoint?.title}
        </h1>
      </div>

      <div className="mb-6">
        {currentUser && isCoordinator ? (
          <Button
            text={
              isCurrentUserCoordinator
                ? "Sair do ponto de distribuição"
                : "Inscrever-se no ponto"
            }
            className={
              isCurrentUserCoordinator
                ? "btn-error text-white"
                : "btn-primary text-white"
            }
            disabled={requesting}
            onClick={() => {
              if (isCurrentUserCoordinator) {
                handleUnsubscribe();
              } else {
                handleSubscribe();
              }
            }}
          />
        ) : (
          currentUser && (
            <Alert
              icon={<IoWarningOutline />}
              type="alert-warning"
              className=""
            >
              <p>
                Para se inscrever neste ponto de distribuição, você precisa ser
                um coordenador.
              </p>
            </Alert>
          )
        )}
      </div>

      <div className="card rounded-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          {coordinators.length === 0 ? (
            <Alert
              icon={<IoWarningOutline />}
              type="alert-info"
              className=""
            >
              <p>Nenhum coordenador vinculado a este ponto.</p>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Veículo</th>
                    {(isOwner || isAdmin) && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {coordinators.map((coordinator, index) => (
                    <tr key={coordinator.id}>
                      <td className="font-semibold">
                        {coordinator.name}
                        {index === 0 && (
                          <span className="badge badge-primary ml-2">
                            Proprietário
                          </span>
                        )}
                      </td>
                      <td>{coordinator.email}</td>
                      <td>{coordinator.phone || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            coordinator.hasVehicle
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {coordinator.hasVehicle ? "Sim" : "Não"}
                        </span>
                      </td>
                      {(isOwner || isAdmin) && (
                        <td>
                          <button
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                            disabled={index === 0 || requesting}
                            onClick={() => {
                              setSelectedCoordinator(coordinator);
                              setOpenModalRemove(true);
                            }}
                            title={
                              index === 0
                                ? "Não pode remover o proprietário"
                                : "Remover coordenador"
                            }
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(isOwner || isAdmin) && selectedCoordinator && (
        <ModalConfirmAction
          title={`Tem certeza que deseja remover ${selectedCoordinator.name}?`}
          open={openModalRemove}
          close={() => setOpenModalRemove(false)}
          onSubmit={handleRemoveCoordinator}
        />
      )}
    </div>
  );
}
