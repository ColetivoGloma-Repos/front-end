import React from "react";
import { Button } from "../../components/common/Button";
import { useAuthProvider } from "../../context/Auth";
import ProfilePersonalInfo from "../../components/pages/Profile/Edit/ProfilePersonalInfo";
import { Avatar } from "../../components/common";
import ProfileAddress from "../../components/pages/Profile/Edit/ProfileAddress";
import { askIfChangeStatusToCoordinator, updateUser } from "../../services/auth.service";
import { IUserUpdate } from "../../interfaces/user";
import { toast } from "react-toastify";
import { toastMessage } from "../../helpers/toast-message";
import ProfileVehicle from "../../components/pages/Profile/Edit/VehicleInfo";
import ToRequireCoordinator from "../../components/pages/Profile/Edit/CoordinatorRequest";

export default function ProfileScreen() {
  const { currentUser, loginUser, updateCurrentUser } = useAuthProvider();
  const [user, setUser] = React.useState(currentUser);
  const [request, setRequesting] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setUser({ ...currentUser });
    }
  }, [currentUser]);

  const handleEditToggle = async () => {
    setRequesting(true);
    if (!request) {        
        if (request) {
          toast.warn("Carregando...");
        }
      try {        
        const updatedUser = await updateUser(currentUser!.id, user as IUserUpdate);
        updateCurrentUser(updatedUser);
        toast.success("Usuário atualizado com sucesso");
      } catch (error) {
        console.error(error);
        toast.error(toastMessage.INTERNAL_SERVER_ERROR);
      } finally {
        setRequesting(false);
      }
    }
  };

   const handleAskIfCanToChangeForCoordinador = async () => {
      try {
        setRequesting(true);
        await askIfChangeStatusToCoordinator(currentUser!.id);
        await loginUser();
        toast.success("Solicitação enviada com sucesso");
      } catch (error: any) {
        toast.error(error?.message || toastMessage.INTERNAL_SERVER_ERROR);
      } finally {
        setRequesting(false);
      }
  };

  const hasCoordinatorRole = currentUser?.roles.includes("coordinator");
  const isCoordinator = hasCoordinatorRole && user?.status === "approved";
  const isCoordinatorPending = hasCoordinatorRole && user?.status === "pending";
  const isCoordinatorCanceled = hasCoordinatorRole && user?.status === "canceled";
  const isCommonUser =
    !hasCoordinatorRole ||
    !user?.status ||
    !["approved", "pending", "canceled"].includes(user.status);

  const coordinatorStatusLabel = isCoordinator
    ? "Aprovado"
    : isCoordinatorPending
    ? "Pendente"
    : isCoordinatorCanceled
    ? "Cancelado"
    : "";

  return (
    <section className="profile-section p-5 flex h-full min-h-screen">
      {user ? (
        <div className="w-full max-w-4xl mx-auto bg-base-100 shadow-xl p-5 border-2 rounded-lg">
          <div className="flex flex-col items-center mb-6">
            <Avatar
              src={user.url || ""}
              alt={user.name}
              className="mb-4 w-24 h-24 rounded-full"
            />
            <h2 className="text-2xl font-bold">Perfil do Usuário</h2>
          </div>
          {isCommonUser ? (
            <ToRequireCoordinator onRequest={handleAskIfCanToChangeForCoordinador} />
          ) : (
            <div className="mb-4 text-sm text-gray-700">
              <span className="font-semibold">Status do coordenador:</span>{" "}
              {coordinatorStatusLabel}
            </div>
          )}

         
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <ProfilePersonalInfo currentUser={user} setUser={setUser} />
            </div>

            <div className="space-y-4">
              <ProfileAddress address={user.address} setUser={setUser} />

              <ProfileVehicle
                hasVehicle={user?.hasVehicle}
                vehicleType={user?.vehicleType}
                setUser={setUser}
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleEditToggle}
                className="btn btn-primary"
                text={request ? "Enviando" : "Salvar"}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className="w-full flex justify-center p-5">
          <h1 className="text-3xl">Usuário não encontrado</h1>
        </div>
      )}
    </section>
  );
}
