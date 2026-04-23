import React from "react";

type Props = {
  address: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

export default function ProfileAddress({ address, setUser }: Props) {
  const [loadingCep, setLoadingCep] = React.useState(false);
  const [cepError, setCepError] = React.useState("");

  const handleChange = (field: string, value: string) => {
    setUser((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleCepChange = async (raw: string) => {
    const cep = raw.replace(/\D/g, "");
    handleChange("cep", cep);
    setCepError("");

    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }

      setUser((prev: any) => ({
        ...prev,
        address: {
          ...prev.address,
          cep,
          logradouro: data.logradouro || prev.address?.logradouro || "",
          bairro: data.bairro || prev.address?.bairro || "",
          municipio: data.localidade || prev.address?.municipio || "",
          estado: data.uf || prev.address?.estado || "",
          pais: "Brasil",
        },
      }));
    } catch {
      setCepError("Erro ao buscar CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="form-control col-span-2">
      <label className="label">
        <span className="label-text">Endereço</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="form-control">
          <label className="label">
            <span className="label-text">CEP</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={address?.cep || ""}
              maxLength={8}
              placeholder="00000000"
              className={`input input-bordered w-full ${cepError ? "input-error" : ""}`}
              onChange={(e) => handleCepChange(e.target.value)}
            />
            {loadingCep && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs" />
            )}
          </div>
          {cepError && <span className="text-error text-xs mt-1">{cepError}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Número</span>
          </label>
          <input
            type="text"
            value={address?.numero || ""}
            className="input input-bordered w-full"
            onChange={(e) => handleChange("numero", e.target.value)}
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Logradouro</span>
          </label>
          <input
            type="text"
            value={address?.logradouro || ""}
            className="input input-bordered w-full"
            onChange={(e) => handleChange("logradouro", e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Bairro</span>
          </label>
          <input
            type="text"
            value={address?.bairro || ""}
            className="input input-bordered w-full"
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
            className="input input-bordered w-full"
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
            className="input input-bordered w-full"
            onChange={(e) => handleChange("estado", e.target.value.toUpperCase())}
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Complemento</span>
          </label>
          <input
            type="text"
            value={address?.complemento || ""}
            className="input input-bordered w-full"
            onChange={(e) => handleChange("complemento", e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}
