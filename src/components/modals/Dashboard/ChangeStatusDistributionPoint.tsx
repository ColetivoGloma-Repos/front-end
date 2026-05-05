import { useForm } from "react-hook-form";
import { Button, Modal, Select } from "../../common";
import { IChangeStatus } from "../../../interfaces/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeStatus } from "../../../validators/change-status";

const distributionPointStatusList = [
  { label: "Selecione", value: "" },
  { label: "Pendente", value: "PENDING" },
  { label: "Aprovado", value: "APPROVED" },
  { label: "Rejeitado", value: "REJECTED" },
];

interface IModalDistributionPoint {
  close: () => void;
  open: boolean;
  onSubmit: (data: IChangeStatus) => void;
  id: string;
}

export function ModalStatusDistributionPoint({ close, open, onSubmit, id }: IModalDistributionPoint) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IChangeStatus>({
    resolver: zodResolver(changeStatus),
  });

  const onFinish = (data: IChangeStatus) => {
    onSubmit({ ...data, id });
    reset();
  };

  return (
    <Modal
      open={open}
      close={close}
      header={
        <div className="p-4">
          <p className="font-semibold text-lg">Atualizar Status do Ponto de Distribuição</p>
        </div>
      }
    >
      <div className="p-4 pt-10">
        <form className="grid grid-flow-row auto-rows-max gap-2" onSubmit={handleSubmit(onFinish)}>
          <Select
            label="Status:"
            {...register("status")}
            options={distributionPointStatusList}
            errors={errors}
          />
          <Button type="submit" text="Atualizar" className="w-full mt-4 bg-black text-white" />
        </form>
      </div>
    </Modal>
  );
}
