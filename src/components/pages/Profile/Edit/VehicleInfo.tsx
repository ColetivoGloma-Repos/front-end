import React from "react";

type Props = {
  hasVehicle?: boolean;
  vehicleType?: string;
  isEditing: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

const vehicleTypes = [
  { name: "car", value: "Carro" },
  { name: "motorcycle", value: "Moto" },
  { name: "truck", value: "Caminhão" },
  { name: "van", value: "Van" },
  { name: "other", value: "Outro" },
];

export default function ProfileVehicle({ hasVehicle, vehicleType, isEditing, setUser }: Props) {
  const handleChange = (field: "hasVehicle" | "vehicleType", value: any) => {
    setUser((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="form-control col-span-2">
      <label className="label">
        <span className="label-text">Veículo</span>
      </label>

      <label className="cursor-pointer flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={!!hasVehicle}
          disabled={!isEditing}
          onChange={(e) => {
            const checked = e.target.checked;
            handleChange("hasVehicle", checked);
            if (!checked) handleChange("vehicleType", ""); // limpa tipo ao desmarcar
          }}
        />
        <span className="label-text">Possui veículo?</span>
      </label>

      {hasVehicle && (
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Tipo de veículo</span>
          </label>
          <select
            className="select select-bordered"
            value={vehicleType || ""}
            disabled={!isEditing}
            onChange={(e) => handleChange("vehicleType", e.target.value)}
          >
            <option value="">Selecione um tipo</option>
            {vehicleTypes.map((v) => (
              <option key={v.name} value={v.value}>
                {v.value}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
