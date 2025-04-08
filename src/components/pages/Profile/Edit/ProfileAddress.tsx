import React from "react";

export default function ProfileAddress({
  address,
  isEditing,
}: {
  address: any;
  isEditing: boolean;
}) {
  return (
    <div className="form-control col-span-2">
      <label className="label">
        <span className="label-text">Endereço</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Logradouro</span>
          </label>
          <input
            type="text"
            value={address?.logradouro || "Não informado"}
            className="input input-bordered"
            readOnly={!isEditing}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Número</span>
          </label>
          <input
            type="text"
            value={address?.numero || "S/N"}
            className="input input-bordered"
            readOnly={!isEditing}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Bairro</span>
          </label>
          <input
            type="text"
            value={address?.bairro || "Não informado"}
            className="input input-bordered"
            readOnly={!isEditing}
            disabled
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Município</span>
          </label>
          <input
            type="text"
            value={address?.municipio || "Não informado"}
            className="input input-bordered"
            readOnly={!isEditing}
            disabled
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Estado</span>
          </label>
          <input
            type="text"
            value={address?.estado?.toUpperCase() || "Não informado"}
            className="input input-bordered"
            readOnly={!isEditing}
            disabled
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">CEP</span>
          </label>
          <input
            type="text"
            value={address?.cep || "Não informado"}
            className="input input-bordered"
            readOnly={!isEditing}
          />
        </div>
        <div className="form-control col-span-2">
          <label className="label">
            <span className="label-text">Complemento</span>
          </label>
          <input
            type="text"
            value={address?.complemento || "Não informado"}
            className="input input-bordered"
            readOnly={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}