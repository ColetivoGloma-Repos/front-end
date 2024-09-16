import React from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Modal, Select, Textarea } from "../common";
import { IProduct, IProductCreate } from "../../interfaces/products";
import { productSchema } from "../../validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { percentageMask } from "../../utils/masks";

interface IModalProduct {
  close: () => void;
  open: boolean;
  onSubmit: (data: IProductCreate) => void;
  modalType?: "create" | "update";
  product?: IProduct;
}

export function ModalProduct({
  close,
  open,
  onSubmit,
  modalType = "create",
  product,
}: IModalProduct) {
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IProductCreate>({ resolver: zodResolver(productSchema) });

  const onFinish = (data: IProductCreate) => {
    onSubmit(data);
    reset();
  };

  React.useEffect(() => {
    if (product && modalType === "update") {
      for (const k in product) {
        const key = k as keyof IProduct;

        setValue(key as any, product[key]);
      }
    }
  }, [product, modalType]);

  return (
    <Modal
      open={open}
      close={close}
      header={
        <div className="p-4">
          <p className="font-semibold text-lg">
            {modalType === "create" ? "Doar" : "Atualizar"} produto
          </p>
        </div>
      }
    >
      <div className="p-4 pt-10">
        <form
          className={`
            grid grid-cols-1 md:grid-cols-2
            gap-2 gap-x-4
          `}
          onSubmit={handleSubmit(onFinish)}
        >
          <Input
            label="Nome: "
            placeholder="Digite o nome"
            required
            {...register("name")}
            errors={errors}
            containerClassName="col-span-1 md:col-span-2"
          />

          <Select
            label="Tipo: "
            required
            {...register("type")}
            options={[
              { label: "Perecivel", value: "perishable" },
              { label: "Não perecivel", value: "not_perishable" },
            ]}
            errors={errors}
          />

          <Input
            label="Peso: "
            placeholder="Digite o peso"
            {...register("weight")}
            mask={percentageMask}
            errors={errors}
          />

          <Textarea
            label="Descrição: "
            placeholder="Digite uma descrição"
            {...register("description")}
            errors={errors}
            containerClassName="col-span-1 md:col-span-2"
          />

          <Button
            type="submit"
            text={`${modalType === "create" ? "Doar" : "Atualizar"} produto`}
            className="w-full mt-4 bg-black text-white col-span-1 md:col-span-2"
          />
        </form>
      </div>
    </Modal>
  );
}
