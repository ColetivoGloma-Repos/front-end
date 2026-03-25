import {
  IoCheckmarkCircleOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { IActionType } from "../interface/common";

interface IModalRequestedProductActionProps {
  onClose: () => void;
  onSubmit: (actionType: IActionType) => void;
  productName: string;
  distributionPointName: string;
  actionType: IActionType;
}

export function ModalRequestedProductAction({
  actionType,
  distributionPointName,
  productName,
  onClose,
  onSubmit,
}: IModalRequestedProductActionProps) {
  return (
    <>
      <div className="modal modal-open z-[60]">
        <div className="modal-box w-full max-w-sm md:max-w-md mx-4 border-t-4 border-warning rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {actionType === "approve" ? (
                <IoCheckmarkCircleOutline className="text-success" size={24} />
              ) : (
                <IoTrashOutline className="text-error" size={24} />
              )}
              Confirmar Ação
            </h3>

            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square rounded-lg"
              aria-label="Fechar"
              onClick={onClose}
            >
              <IoCloseOutline size={18} />
            </button>
          </div>

          <div className="py-4 space-y-3">
            {actionType === "approve" && (
              <div className="alert alert-warning text-xs p-3 rounded-2xl">
                <IoWarningOutline size={16} />
                <div>
                  A meta não foi atingida. Deseja aprovar todas as doações e finalizar
                  mesmo assim?
                </div>
              </div>
            )}

            {actionType === "reject" && (
              <div className="alert alert-error bg-error/10 text-xs p-3 rounded-2xl">
                <IoAlertCircleOutline size={16} />
                <div>
                  Isso rejeitará permanentemente o pedido e todas as doações vinculadas.
                </div>
              </div>
            )}

            <div className="divider my-1"></div>

            <p className="text-xs opacity-70">
              Item: <span className="font-bold">{productName}</span>
              <br />
              Ponto: <span className="font-bold">{distributionPointName}</span>
            </p>
          </div>

          <div className="modal-action flex-col md:flex-row gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm order-2 rounded-lg md:order-1"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              className={`btn btn-sm rounded-lg ${
                actionType === "approve"
                  ? "btn-success text-white"
                  : "btn-error text-white"
              } order-1 md:order-2`}
              onClick={() => onSubmit(actionType)}
            >
              Confirmar
            </button>
          </div>
        </div>

        <div className="modal-backdrop" onClick={onClose}></div>
      </div>
    </>
  );
}
