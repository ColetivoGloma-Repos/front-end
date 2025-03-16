import { useForm } from "react-hook-form";
import { Button, Modal, Select } from "../../common";
import { IChangeStatus } from "../../../interfaces/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { statusList } from "./status.list";
import { changeStatus } from "../../../validators/change-status";

interface IModalCoordinator {
  close: () => void;
  open: boolean;
  onSubmit: (data: IChangeStatus) => void;
  id: string;
}

export function ModalStatus({ close, open, onSubmit, id }: IModalCoordinator) {
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
          <p className="font-semibold text-lg">Atualizar Status</p>
        </div>
      }
    >
      <div className="p-4 pt-10">
        <form className="grid grid-flow-row auto-rows-max gap-2" onSubmit={handleSubmit(onFinish)}>
          <Select
            label="Status:"
            {...register("status")}
            options={statusList}
            errors={errors}
          />
          <Button type="submit" text="Atualizar" className="w-full mt-4 bg-black text-white" />
        </form>
      </div>
    </Modal>
  );
}
