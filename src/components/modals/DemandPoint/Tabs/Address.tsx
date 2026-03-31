import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../../common";
import { zipCodeMask } from "../../../../utils/masks";
import { IDemandPointCreate } from "../../../../interfaces/demand-point";

interface ITabAddress {
  register: UseFormRegister<IDemandPointCreate>;
  errors: FieldErrors<IDemandPointCreate>;
}

export function TabAddress({ register, errors }: ITabAddress) {
  return (
    <div
      className={`
        grid grid-cols-1 gap-2 gap-x-4
        md:grid-cols-2
        `}
      >
       <Input
        label="CEP: "
        placeholder="Digite o CEP"
        {...register("collectPoint.cep")}
        errors={errors}
        />
      <Input
        label="Estado: "
        placeholder="Digite o estado"
        {...register("collectPoint.estado")}
        errors={errors}
      />
      <Input
        label="País: "
        placeholder="Digite o país"
        {...register("collectPoint.pais")}
        errors={errors}
      />
      <Input
        label="Município: "
        placeholder="Digite o município"
        {...register("collectPoint.municipio")}
        errors={errors}
      />
      <Input
        label="Bairro: "
        placeholder="Digite o bairro"
        {...register("collectPoint.bairro")}
        errors={errors}
      />
      <div className="md:col-span-2 flex gap-4">
        <Input
          label="Logradouro: "
          placeholder="Digite o logradouro"
          {...register("collectPoint.logradouro")}
          errors={errors}
          containerClassName="flex-1 min-w-0"
        />
        <Input
          label="Número: "
          placeholder="Digite o número"
          {...register("collectPoint.numero")}
          errors={errors}
          containerClassName="w-28 shrink-0"
        />
      </div>
      <Input
        label="Complemento: "
        placeholder="Digite o complemento"
        {...register("collectPoint.complemento")}
        errors={errors}
      />
    </div>
  );
}
