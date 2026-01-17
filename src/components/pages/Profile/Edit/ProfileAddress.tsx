import React from "react";

type Props = {
  address: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

export default function ProfileAddress({ address, setUser }: Props) {
  const handleChange = (field: string, value: string) => {
    setUser((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

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
            value={address?.logradouro || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("logradouro", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Número</span>
          </label>
          <input
            type="text"
            value={address?.numero || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("numero", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Bairro</span>
          </label>
          <input
            type="text"
            value={address?.bairro || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("bairro", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Município</span>
          </label>
          <input
            type="text"
            value={address?.municipio || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("municipio", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Estado</span>
          </label>
          <input
            type="text"
            value={address?.estado?.toUpperCase() || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("estado", e.target.value.toUpperCase())}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">CEP</span>
          </label>
          <input
            type="text"
            value={address?.cep || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("cep", e.target.value)}
          />
        </div>

        <div className="form-control col-span-2">
          <label className="label">
            <span className="label-text">Complemento</span>
          </label>
          <input
            type="text"
            value={address?.complemento || ""}
            className="input input-bordered"
            onChange={(e) => handleChange("complemento", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
