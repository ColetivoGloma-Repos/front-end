import React from "react";
import {
  IoMdClose,
  IoMdCheckmark,
  IoMdCreate,
  IoMdTrash,
  IoMdLogIn,
  IoMdUndo,
  IoMdCube,
  IoMdWarning,
} from "react-icons/io";
import { IoCar, IoHome } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IRequestedProduct,
  IUpdateRequestedProduct,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point/point-requested-product";
import { DonationCollectionType } from "../../../interfaces/distribution-point";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { ActionButton } from "./ActionButton";
import { upsertRequestedProductSchema } from "../validations/upsert-requested-product";
import { integerMask } from "../../../utils/masks";

type LoadingActionType = null | "donate" | "cancel" | "edit" | "delete" | "confirm";
interface IRequestedProductCardProps {
  requestedProduct: IRequestedProduct;
  isAdmin: boolean;
  isLoggedIn: boolean;
  userDonatedAmount?: number;
  onDonate: (amount: number, collectionType: DonationCollectionType) => void;
  onCancelDonation: () => void;
  onEdit: (updatedRequestedProduct: IUpdateRequestedProduct) => void;
  onDelete: () => void;
}

type EditRequestedProductForm = {
  name: string;
  requestedQuantity: number;
};

export function RequestedProductCard({
  requestedProduct,
  isAdmin,
  isLoggedIn,
  userDonatedAmount = 0,
  onDonate,
  onCancelDonation,
  onEdit,
  onDelete,
}: IRequestedProductCardProps) {
  const [donateAmount, setDonateAmount] = React.useState<string>("");
  const [donationError, setDonationError] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showCollectionModal, setShowCollectionModal] = React.useState(false);
  const [loadingAction, setLoadingAction] = React.useState<LoadingActionType>(null);

  const product = requestedProduct.product;

  const deliveredQuantity = requestedProduct.deliveredQuantity;
  const donatedQuantity = requestedProduct.donatedQuantity;
  const requestedQuantity = requestedProduct.requestedQuantity;

  const remaining = Math.max(0, requestedQuantity - donatedQuantity);

  const isLocked =
    requestedProduct.status === RequestedProductStatus.FULL ||
    requestedProduct.status === RequestedProductStatus.DELIVERED;
  const isDelivered = requestedProduct.status === RequestedProductStatus.DELIVERED;
  const isFull = requestedProduct.status === RequestedProductStatus.FULL;

  const safeTarget = Math.max(1, requestedQuantity);

  const deliveredClamped = Math.max(0, Math.min(deliveredQuantity, safeTarget));
  const donatedClamped = Math.max(0, Math.min(donatedQuantity, safeTarget));

  const deliveredPercent = Math.min(100, (deliveredClamped / safeTarget) * 100);

  const donatedButNotDelivered = Math.max(0, donatedClamped - deliveredClamped);
  const donatedButNotDeliveredPercent = Math.min(
    100 - deliveredPercent,
    (donatedButNotDelivered / safeTarget) * 100,
  );

  const isLoadingDonate = loadingAction === "donate";
  const isLoadingCancel = loadingAction === "cancel";
  const isLoadingEdit = loadingAction === "edit";
  const isLoadingDelete = loadingAction === "delete";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<EditRequestedProductForm>({
    resolver: zodResolver(upsertRequestedProductSchema(true, true)),
    defaultValues: {
      name: product.name,
      requestedQuantity: requestedProduct.requestedQuantity,
    },
    mode: "onSubmit",
  });

  const handleDonate = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = parseFloat(donateAmount);
    if (!isNaN(amount) && amount > 0) {
      if (amount > remaining) {
        setDonationError(`O valor máximo permitido é ${remaining} ${product.unit}`);
        return;
      }
      setDonationError(null);
      setShowCollectionModal(true);
    }
  };

  const handleCollectionChoice = async (collectionType: DonationCollectionType) => {
    setShowCollectionModal(false);
    const amount = parseFloat(donateAmount);
    setLoadingAction("donate");
    try {
      await Promise.resolve(onDonate(amount, collectionType));
      setDonateAmount("");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelDonation = async () => {
    setLoadingAction("cancel");
    try {
      await Promise.resolve(onCancelDonation());
    } finally {
      setLoadingAction(null);
    }
  };

  const onSubmitEdit = async (data: EditRequestedProductForm) => {
    setLoadingAction("edit");

    try {
      const payload: IUpdateRequestedProduct = {
        productName: data.name,
        requestedQuantity: data.requestedQuantity,
      };
      await Promise.resolve(onEdit(payload));
      reset({
        name: product.name,
        requestedQuantity: requestedProduct.requestedQuantity,
      });
      setIsEditing(false);
    } catch (e) {
      const error = e as Error & { statusCode: number };
      console.error(error);

      if (error.statusCode === 400) {
        setError("requestedQuantity", { message: error.message });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setLoadingAction("delete");
    try {
      await Promise.resolve(onDelete());
      setShowDeleteConfirm(false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelAction = () => {
    setIsEditing(false);
    clearErrors();
    reset({
      name: product.name,
      requestedQuantity: requestedProduct.requestedQuantity,
    });
  };

  const style = (status: RequestedProductStatus) => {
    switch (status) {
      case RequestedProductStatus.DELIVERED:
        return {
          barDeliveredColor: "bg-success",
          barPendingColor: "bg-success/40",
          cardColor: "bg-success/10 border border-success/20",
        };
      case RequestedProductStatus.FULL:
        return {
          barDeliveredColor: "bg-warning",
          barPendingColor: "bg-warning/40",
          cardColor: "bg-warning/10 border border-warning/20",
        };
      case RequestedProductStatus.OPEN:
      default:
        return {
          barDeliveredColor: "bg-primary",
          barPendingColor: "bg-primary/40",
          cardColor: "bg-base-100 border border-base-200",
        };
    }
  };

  const donateDisabled = isLoadingDonate || isLoadingDelete || isLoadingEdit;
  const cancelDisabled = isLoadingCancel || isLoadingDelete || isLoadingEdit;
  const adminButtonsDisabled = isLoadingDelete || isLoadingEdit;

  if (isEditing) {
    return (
      <div className="card rounded-2xl bg-base-100 shadow-sm border border-primary/20">
        <div className="card-body p-4">
          <label className="label">
            <span className="label-text font-bold uppercase text-xs text-base-content/50">
              Editar Produto
            </span>
          </label>

          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <Input
              type="text"
              placeholder="Nome do produto"
              className="input-sm"
              disabled={isLoadingEdit}
              label={undefined}
              errors={errors}
              {...register("name")}
            />

            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                disabled={isLoadingEdit}
                placeholder="Meta"
                className="input-sm w-full"
                containerClassName="w-full"
                label={undefined}
                errors={errors}
                mask={integerMask}
                {...register("requestedQuantity", { valueAsNumber: true })}
              />

              <p className="badge badge-ghost size-10 rounded-lg text-black mb-auto">
                {product.unit}
              </p>
            </div>

            <div className="card-actions justify-end mt-4">
              <ActionButton
                disabled={adminButtonsDisabled}
                onClick={handleCancelAction}
                icon={<IoMdClose size={18} />}
                className="rounded-lg"
                styleType="red"
              />
              <ActionButton
                disabled={adminButtonsDisabled}
                icon={<IoMdCheckmark size={18} />}
                className="rounded-lg"
                styleType="blue"
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`card rounded-2xl shadow-sm transition-all ${style(requestedProduct.status).cardColor}`}
      >
        <div className="card-body p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="card-title text-base flex items-center gap-2">
                {product.name}
                {isDelivered && <IoMdCheckmark size={16} className="text-success" />}
                {isFull && <IoMdCube size={16} className="text-warning" />}
              </h4>
              <p className="text-sm text-base-content/70">
                {deliveredQuantity} entregues | {donatedQuantity} doadas |{" "}
                {requestedQuantity} meta {product.unit}
              </p>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <ActionButton
                  disabled={adminButtonsDisabled}
                  onClick={() => setIsEditing(true)}
                  icon={<IoMdCreate size={16} />}
                  className="rounded-lg"
                  styleType="blue"
                />
                <ActionButton
                  disabled={adminButtonsDisabled}
                  onClick={() => setShowDeleteConfirm(true)}
                  icon={<IoMdTrash size={16} />}
                  className="rounded-lg"
                  styleType="red"
                />
              </div>
            )}
          </div>

          <div className="w-full h-4 bg-base-200 rounded-full overflow-hidden flex mb-4 relative">
            <div
              className={`h-full ${style(requestedProduct.status).barDeliveredColor} transition-all duration-500`}
              style={{ width: `${deliveredPercent}%` }}
            />
            <div
              className={`h-full ${style(requestedProduct.status).barPendingColor} transition-all duration-500`}
              style={{ width: `${donatedButNotDeliveredPercent}%` }}
            />
          </div>

          {!isAdmin && !isLocked && isLoggedIn && (
            <div className="flex flex-col gap-1">
              <form onSubmit={handleDonate} className="flex gap-2">
                <Input
                  disabled={donateDisabled}
                  value={donateAmount}
                  onChange={(e) => {
                    setDonateAmount((e.target as HTMLInputElement).value);
                    setDonationError(null);
                  }}
                  mask={integerMask}
                  placeholder={`Max: ${remaining}`}
                  className={`input-sm flex-1 ${donationError ? "input-error" : ""}`}
                  containerClassName="flex-1"
                />
                <Button
                  type="submit"
                  className="btn-primary btn-sm text-white"
                  text={isLoadingDonate ? "Doando..." : "Doar"}
                  disabled={donateDisabled || Number(donateAmount ?? 0) <= 0}
                />
              </form>
              {donationError && (
                <p className="text-error text-sm text-center">{donationError}</p>
              )}
            </div>
          )}

          {!isAdmin && !isLocked && !isLoggedIn && (
            <div className="flex rounded-lg items-center justify-center py-2 bg-base-200/50 gap-2 text-base-content/60">
              <IoMdLogIn size={14} />
              <span className="text-xs font-medium">Faça login para doar</span>
            </div>
          )}

          {!isAdmin && userDonatedAmount > 0 && (
            <div className="mt-3 pt-3 border-t border-base-200 flex justify-between items-center">
              <span className="text-xs text-success font-semibold flex items-center gap-1">
                <IoMdCheckmark size={12} /> Em espera para entrega: {userDonatedAmount}{" "}
                {product.unit}
              </span>

              <Button
                type="button"
                onClick={handleCancelDonation}
                className="btn-xs h-8 px-3 border-none text-error bg-error/15 hover:bg-error/20 no-underline"
                prefix={<IoMdUndo size={12} className="mr-1" />}
                text={isLoadingCancel ? "Cancelando..." : "Cancelar doação"}
                disabled={cancelDisabled}
              />
            </div>
          )}

          {isFull && (
            <div className="alert rounded-lg gap-2 alert-warning py-2 text-sm flex justify-center flex-col items-center">
              <span className="font-semibold">Aguardando processamento...</span>
              <span className="text-xs">
                Meta de doações atingida, aguardando confirmação de entrega.
              </span>
            </div>
          )}

          {isDelivered && (
            <div className="alert rounded-lg alert-success py-2 text-sm flex justify-center flex-col items-center">
              <span className="font-bold flex items-center gap-1">
                <IoMdCheckmark size={16} /> Entrega Confirmada! Obrigado.
              </span>
            </div>
          )}
        </div>
      </div>

      {showCollectionModal && (
        <div className="modal modal-open z-50">
          <div className="modal-box rounded-2xl max-w-sm">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <IoMdWarning size={22} className="text-warning" /> Como será a entrega?
            </h3>
            <p className="py-3 text-sm text-base-content/70">
              Você vai levar <strong>{donateAmount} {product.unit}</strong> de{" "}
              <strong>{product.name}</strong> até o ponto de coleta, ou precisa que alguém
              busque?
            </p>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="button"
                className="btn btn-primary rounded-xl w-full text-white gap-2"
                onClick={() => handleCollectionChoice(DonationCollectionType.DELIVERY)}
              >
                <IoCar size={18} /> Vou entregar
              </button>
              <button
                type="button"
                className="btn btn-outline rounded-xl w-full gap-2"
                onClick={() => handleCollectionChoice(DonationCollectionType.PICKUP)}
              >
                <IoHome size={18} /> Preciso de coleta
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-xl w-full text-base-content/50"
                onClick={() => setShowCollectionModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCollectionModal(false)} />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal modal-open z-50">
          <div className="modal-box rounded-2xl">
            <h3 className="font-bold text-lg flex items-center gap-2 text-error">
              <IoMdWarning size={24} /> Confirmar Exclusão
            </h3>
            <p className="py-4">
              Você tem certeza que deseja excluir a solicitação para{" "}
              <strong>{product.name}</strong>?
              <br />
              <span className="text-sm opacity-75">
                Esta ação não pode ser desfeita e removerá todas as doações associadas.
              </span>
            </p>

            <div className="modal-action flex-col md:flex-row gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm order-2 rounded-lg md:order-1"
                disabled={isLoadingDelete}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoadingDelete}
                className="btn btn-sm rounded-lg btn-error text-white"
                onClick={handleDelete}
              >
                {isLoadingDelete ? "Excluindo..." : "Excluir Solicitação"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
        </div>
      )}
    </>
  );
}
