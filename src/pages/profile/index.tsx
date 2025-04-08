import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button } from "../../components/common";
import { useAuthProvider } from "../../context/Auth";
import ProfilePersonalInfo from "../../components/pages/Profile/Edit/ProfilePersonalInfo";
import ProfileAddress from "../../components/pages/Profile/Edit/ProfileAddress";

export default function ProfileScreen() {
  const { currentUser } = useAuthProvider();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <section className="profile-section p-5 flex h-screen">
      {currentUser?.data ? (
        <div className="card w-full bg-base-100 shadow-xl p-5">
          <div className="flex flex-col items-center">
            <Avatar
              src={currentUser.data.url || ""}
              className="mb-4 w-24 h-24 rounded-full"
            />
            <h2 className="text-2xl font-bold mb-4">Perfil do Usuário</h2>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informações Pessoais */}
            <ProfilePersonalInfo currentUser={currentUser.data} isEditing={isEditing} />

            <ProfileAddress address={currentUser.data.address} isEditing={isEditing} />

            {/* Veículo */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Veículo</span>
              </label>
              <input
                type="text"
                value={
                  currentUser.data.hasVehicle
                    ? currentUser.data.vehicleType || "Tipo não informado"
                    : "Não possui"
                }
                className="input input-bordered"
                readOnly={!isEditing}
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