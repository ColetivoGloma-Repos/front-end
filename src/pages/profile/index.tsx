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
import ToRequireinitiativeAdministrator from "../../components/pages/Profile/Edit/InitiativeAdministrator";
import { typeRoles } from "../../interfaces/auth";

export default function ProfileScreen() {
  const { currentUser } = useAuthProvider();
  const [isEditing, setIsEditing] = React.useState(false);
  const [user, setUser] = React.useState(currentUser);
  const [request, setRequesting] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setUser({ ...currentUser });
    }
  }, [currentUser]);

  const handleEditToggle = async () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      try {
        setRequesting(true);
        if (request) {
          toast.warn("Carregando...");
        }
        const updatedUser = await updateUser(currentUser!.id, user as IUserUpdate);
        await setUser(updatedUser);
        toast.success("Usuário atualizado com sucesso");
      } catch (error) {
        console.log(error);
        toast.error(toastMessage.INTERNAL_SERVER_ERROR);
      }
    }
  };

   const handleAskIfCanToChangeForCoordinador = async () => {     
      try {
        setRequesting(true);
        if (request) {
          toast.warn("Carregando...");
        }
        const updatedUser = await askIfChangeStatusToCoordinator(currentUser!.id);
        await setUser(updatedUser);
        toast.success("Usuário atualizado com sucesso");
      } catch (error) {
        console.log(error);
        toast.error(toastMessage.INTERNAL_SERVER_ERROR);
      }
    
  };

  return (
    <section className="profile-section p-5 flex h-full min-h-screen">
      {user ? (
        <div className="w-full max-w-4xl mx-auto bg-base-100 shadow-xl p-5 border-2 rounded-lg">
          <div className="flex flex-col items-center mb-6">
            <Avatar
              src={user.url || ""}
              className="mb-4 w-24 h-24 rounded-full"
            />
            <h2 className="text-2xl font-bold">Perfil do Usuário</h2>
          </div>
         {!currentUser?.roles?.includes('coordinator') && (
            <ToRequireCoordinator onRequest={handleAskIfCanToChangeForCoordinador} />
          )}

         {currentUser?.roles.includes('coordinator') && (
            <ToRequireinitiativeAdministrator
          onRequest={handleAskIfCanToChangeForCoordinador}
          />
        )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <ProfilePersonalInfo
                currentUser={user}
                isEditing={isEditing}
                setUser={setUser}
              />
            </div>

            <div className="space-y-4">
              <ProfileAddress
                address={user.address}
                isEditing={isEditing}
                setUser={setUser}
              />

              <ProfileVehicle
                hasVehicle={user?.hasVehicle}
                vehicleType={user?.vehicleType}
                isEditing={isEditing}
                setUser={setUser}
              />
              </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleEditToggle}
                className="btn btn-primary"
                text={isEditing ? "Salvar" : "Editar"}
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
