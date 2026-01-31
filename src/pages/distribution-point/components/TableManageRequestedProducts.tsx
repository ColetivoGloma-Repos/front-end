import React from "react";
import { IoFilter, IoTrashOutline, IoCubeOutline, IoMap } from "react-icons/io5";
import { IQueryRequest } from "../../../interfaces/default";
import { TablePagination } from "./TablePagination";
import {
  IDistributionPoint,
  IRequestedProduct,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point";
import { StatusBadge } from "./StatusBadge";
import { ModalRequestedProductAction } from "./ModalRequestedProductAction";

type IActionType = "approve" | "reject";
interface ITableManageRequestedProductsProps {
  data: IRequestedProduct[];
  distributionPoints: IDistributionPoint[];
  requesting: boolean;
  onReviewRequest: (id: string, actionType: IActionType) => void;
  onParams: (data: IQueryRequest) => void;
  params: {
    limit: number;
    offset: number;
    total: number;
  };
}
interface IFlattenedRequestedProducts extends IRequestedProduct {
  timestamp: number;
  productName: string;
  distributionPointName: string;
}

export function TableManageRequestedProducts({
  onParams,
  onReviewRequest,
  params,
  data,
  distributionPoints,
  requesting,
}: ITableManageRequestedProductsProps) {
  const [openModalType, setOpenModal] = React.useState<IActionType>();
  const [requestedProduct, setRequestedProduct] =
    React.useState<IFlattenedRequestedProducts>();

  const handleActionType = (
    type: IActionType,
    _requestedProduct: IFlattenedRequestedProducts,
  ) => {
    setRequestedProduct(_requestedProduct);
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setRequestedProduct(undefined);
    setOpenModal(undefined);
  };

  const handleSubmitModal = async (actionType: IActionType) => {
    if (!requestedProduct) return;

    await Promise.resolve(onReviewRequest(requestedProduct.id, actionType));

    handleCloseModal();
  };

  const filteredRequestedProducts: IFlattenedRequestedProducts[] = React.useMemo(() => {
    const requestedProducts = data ?? [];

    return requestedProducts.map((requestedProduct) => {
      const distributionPoint = distributionPoints.find(
        (p) => p.id === requestedProduct.distributionPointId,
      );
      const distributionPointName = distributionPoint?.title!
        ? distributionPoint.title
        : "Ponto não informado";

      const productName = requestedProduct?.product?.name!
        ? requestedProduct.product.name
        : "Produto não informado";
      console.log(productName);

      const ts = new Date(requestedProduct.createdAt).getTime();

      return {
        timestamp: ts,
        distributionPointName,
        productName,
        ...requestedProduct,
      };
    });
  }, [data, distributionPoints]);

  return (
    <div className="card rounded-2xl bg-base-100 shadow-xl border-t-4 border-primary overflow-hidden">
      <div className="card-body p-0">
        {filteredRequestedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-50">
            <IoFilter size={48} className="mb-4 text-base-content/30" />
            <p className="font-medium">Nenhum item encontrado.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto min-h-[400px]">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/50 text-base-content/70 text-xs uppercase">
                    <th>Produto / Ponto</th>
                    <th>Progresso</th>
                    <th>Status Pedido</th>
                    <th>Início em</th>
                    <th className="text-right">Gerenciar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestedProducts.map((requestedProduct) => (
                    <tr key={requestedProduct.id} className="hover">
                      <td>
                        <div className="font-bold text-sm">
                          {requestedProduct.productName}
                        </div>
                        <div className="text-xs opacity-50 truncate max-w-[200px]">
                          {requestedProduct.distributionPointName}
                        </div>
                      </td>
                      <td className="min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <progress
                            className={`progress w-full ${requestedProduct.status === RequestedProductStatus.FULL ? "progress-success" : "progress-primary"}`}
                            value={requestedProduct.donatedQuantity}
                            max={requestedProduct.requestedQuantity}
                          />
                          <span className="text-[10px] font-mono opacity-70 leading-3">
                            {requestedProduct.donatedQuantity} /{" "}
                            {requestedProduct.requestedQuantity}{" "}
                            {requestedProduct.product.unit}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={requestedProduct.status} />
                      </td>
                      <td className="text-sm opacity-70">
                        {new Date(requestedProduct.timestamp).toLocaleDateString()}
                        <br />
                        <span className="text-xs opacity-50">
                          {new Date(requestedProduct.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleActionType("reject", requestedProduct)}
                            className="btn btn-sm btn-outline btn-error gap-1 rounded-lg size-9 p-0"
                            disabled={requesting}
                          >
                            <IoTrashOutline size={14} />
                          </button>
                          <button
                            onClick={() =>
                              requestedProduct.status === RequestedProductStatus.FULL
                                ? onReviewRequest(requestedProduct.id, "approve")
                                : handleActionType("approve", requestedProduct)
                            }
                            className="btn btn-sm btn-success text-white gap-1 rounded-lg h-9"
                            disabled={requestedProduct.donatedQuantity <= 0 || requesting}
                          >
                            <IoCubeOutline size={14} /> Confirmar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col divide-y divide-base-200">
              {filteredRequestedProducts.map((requestedProduct) => (
                <div
                  key={requestedProduct.id}
                  className="p-4 bg-base-100 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-base">
                        {requestedProduct.productName}
                      </div>
                      <div className="text-xs opacity-60 flex items-center gap-1">
                        <IoMap size={10} /> {requestedProduct.distributionPointName}
                      </div>
                    </div>
                    <StatusBadge status={requestedProduct.status} />
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <progress
                      className="progress progress-primary w-full h-3"
                      value={requestedProduct.donatedQuantity}
                      max={requestedProduct.requestedQuantity}
                    />
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span>
                        {requestedProduct.donatedQuantity} {requestedProduct.product.unit}{" "}
                        arrecadados
                      </span>
                      <span>Meta: {requestedProduct.requestedQuantity}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      disabled={requesting}
                      onClick={() => handleActionType("reject", requestedProduct)}
                      className="btn btn-sm btn-outline btn-error flex-1 rounded-lg"
                    >
                      <IoTrashOutline size={16} /> Recusar
                    </button>
                    <button
                      disabled={requestedProduct.donatedQuantity <= 0 || requesting}
                      onClick={() =>
                        requestedProduct.status === RequestedProductStatus.FULL
                          ? onReviewRequest(requestedProduct.id, "approve")
                          : handleActionType("approve", requestedProduct)
                      }
                      className="btn btn-sm btn-success text-white flex-1 rounded-lg"
                    >
                      <IoCubeOutline size={16} /> Confirmar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <TablePagination onParams={onParams} params={params} />
          </>
        )}
      </div>

      {openModalType && requestedProduct && (
        <ModalRequestedProductAction
          actionType={openModalType}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
          productName={requestedProduct.productName}
          distributionPointName={requestedProduct.distributionPointName}
        />
      )}
    </div>
  );
}
