import React, { useState } from "react";
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
import {
  IRequestedProduct,
  IUpdateRequestedProduct,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point/point-requested-product";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";

interface IRequestedProductCardProps {
  requestedProduct: IRequestedProduct;
  isAdmin: boolean;
  isLoggedIn: boolean;
  userDonatedAmount?: number;
  onDonate: (amount: number) => void;
  onCancelDonation: () => void;
  onConfirmDelivery?: () => void;
  onEdit: (updatedRequestedProduct: IUpdateRequestedProduct) => void;
  onDelete: () => void;
}

export function RequestedProductCard({
  requestedProduct,
  isAdmin,
  isLoggedIn,
  userDonatedAmount = 0,
  onDonate,
  onCancelDonation,
  onConfirmDelivery,
  onEdit,
  onDelete,
}: IRequestedProductCardProps) {
  const [donateAmount, setDonateAmount] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    productName: requestedProduct.product.name,
    requestedQuantity: requestedProduct.requestedQuantity,
  });

  const product = requestedProduct.product;

  const deliveredQuantity = Number(requestedProduct.deliveredQuantity ?? 0);
  const donatedQuantity = Number(requestedProduct.donatedQuantity ?? 0);
  const requestedQuantity = Number(requestedProduct.requestedQuantity ?? 0);

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

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(donateAmount);
    if (!isNaN(amount) && amount > 0) {
      onDonate(amount);
      setDonateAmount("");
    }
  };

  const handleEditSubmit = () => {
    onEdit(editForm);
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
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

  if (isEditing) {
    return (
      <div className="card rounded-2xl bg-base-100 shadow-sm border border-primary/20">
        <div className="card-body p-4">
          <label className="label">
            <span className="label-text font-bold uppercase text-xs text-base-content/50">
              Editar Produto
            </span>
          </label>

          <Input
            type="text"
            value={editForm.productName}
            onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
            placeholder="Nome do produto"
            className="input-sm"
          />

          <div className="flex items-center gap-2 mt-2">
            <Input
              type="number"
              value={editForm.requestedQuantity}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  requestedQuantity: parseFloat((e.target as HTMLInputElement).value),
                })
              }
              placeholder="Meta"
              className="input-sm w-full"
              containerClassName="w-full"
            />
            <p className="badge badge-ghost size-10 rounded-lg text-black">
              {product.unit}
            </p>
          </div>

          <div className="card-actions justify-end mt-4">
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-xs btn-ghost btn-square text-error !bg-error/15 hover:!bg-error/30 !size-9"
              text={<IoMdClose size={18} />}
            />
            <Button
              type="button"
              onClick={handleEditSubmit}
              className="btn-xs btn-ghost btn-square text-info !bg-info/15 hover:!bg-info/30 !size-9"
              text={<IoMdCheckmark size={18} />}
            />
          </div>
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
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-xs btn-ghost btn-square text-info !bg-info/15 hover:!bg-info/30 !size-9"
                  text={<IoMdCreate size={16} />}
                />
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-xs btn-ghost btn-square text-error !bg-error/15 hover:!bg-error/30 !size-9"
                  text={<IoMdTrash size={16} />}
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
            <form onSubmit={handleDonateSubmit} className="flex gap-2">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                max={remaining}
                value={donateAmount}
                onChange={(e) => setDonateAmount((e.target as HTMLInputElement).value)}
                placeholder={`Max: ${remaining}`}
                className="input-sm flex-1"
                containerClassName="flex-1"
              />
              <Button
                type="submit"
                className="btn-primary btn-sm text-white"
                text="Doar"
              />
            </form>
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
                <IoMdCheckmark size={12} /> Sua doação: {userDonatedAmount} {product.unit}
              </span>

              <Button
                type="button"
                onClick={onCancelDonation}
                className="btn-xs h-8 px-3 border-none text-error bg-error/15 hover:bg-error/20 no-underline"
                prefix={<IoMdUndo size={12} className="mr-1" />}
                text="Cancelar doação"
              />
            </div>
          )}

          {isFull && (
            <div className="alert rounded-lg gap-2 alert-warning py-2 text-sm flex justify-center flex-col items-center">
              <span className="font-semibold">Aguardando processamento...</span>
              <span className="text-xs">
                Meta de doações atingida, aguardando confirmação de entrega.
              </span>

              {isAdmin && onConfirmDelivery && (
                <Button
                  type="button"
                  onClick={onConfirmDelivery}
                  className="btn-sm btn-success text-white w-full mt-2"
                  prefix={<IoMdCube size={16} />}
                  text="Confirmar Entrega"
                />
              )}
            </div>
          )}

          {isDelivered && (
            <div className="alert rounded-lg alert-success py-2 text-sm flex justify-center flex-col items-center">
              <span className="font-bold flex items-center gap-1">
                <IoMdCheckmark size={16} /> Entrega Confirmada! Obrigado.
              </span>

              {!isAdmin && userDonatedAmount > 0 && (
                <Button
                  type="button"
                  onClick={onCancelDonation}
                  className="btn-xs btn-link text-error no-underline mt-1"
                  text="(Cancelar minha doação)"
                />
              )}
            </div>
          )}
        </div>
      </div>

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
            <div className="modal-action">
              <Button
                type="button"
                className="btn"
                onClick={() => setShowDeleteConfirm(false)}
                text="Cancelar"
              />
              <Button
                type="button"
                className="btn btn-error text-white"
                onClick={handleDeleteConfirm}
                text="Excluir Solicitação"
              />
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
