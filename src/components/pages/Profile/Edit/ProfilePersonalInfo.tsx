import React from "react";

type Props = {
  currentUser: any;
  isEditing: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

export default function ProfilePersonalInfo({ currentUser, isEditing, setUser }: Props) {
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
          readOnly={!isEditing}
          onChange={(e) =>
            setUser((prev: any) => ({ ...prev, name: e.target.value }))
          }
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
          readOnly
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
          onChange={(e) =>
            setUser((prev: any) => ({ ...prev, phone: e.target.value }))
          }
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Data de Nascimento</span>
        </label>
        <input
          type="date"
          value={currentUser.birthDate?.split("T")[0] || "2000-01-01"}
          className="input input-bordered"
          readOnly={!isEditing}
          onChange={(e) =>
            setUser((prev: any) => ({ ...prev, birthDate: e.target.value }))
          }
        />
      </div>
    </>
  );
}
