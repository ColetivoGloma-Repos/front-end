import React from "react";

export default function ProfilePersonalInfo({
  currentUser,
  isEditing,
}: {
  currentUser: any;
  isEditing: boolean;
}) {
  return (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Nome</span>
        </label>
        <input
          type="text"
          value={currentUser.name || ""}
          className="input input-bordered"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">E-mail</span>
        </label>
        <input
          type="email"
          value={currentUser.email || ""}
          className="input input-bordered"
          readOnly={true}
          disabled
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Telefone</span>
        </label>
        <input
          type="text"
          value={currentUser.phone || ""}
          className="input input-bordered"
          readOnly={!isEditing}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Data de Nascimento</span>
        </label>
        <input
          type="text"
          value={
            currentUser.birthDate
              ? new Date(currentUser.birthDate).toLocaleDateString("pt-BR")
              : "01/01/2000"
          }
          className="input input-bordered"
          readOnly={!isEditing}
        />
      </div>
    </>
    
  );
}