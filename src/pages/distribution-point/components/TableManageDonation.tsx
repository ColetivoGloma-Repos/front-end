import React from "react";
import { IoCheckmark, IoClose, IoFilter, IoMap } from "react-icons/io5";
import { ActionButton } from "./ActionButton";
import { IQueryRequest } from "../../../interfaces/default";
import { TablePagination } from "./TablePagination";
import {
  DonationStatus,
  IDistributionPoint,
  IDonation,
} from "../../../interfaces/distribution-point";
import { StatusBadge } from "./StatusBadge";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { Avatar } from "../../../components/common";

type IActionType = "approve" | "reject";
type DashboardTab = "donations" | "history" | "requests";
interface ITableManageDonationProps {
  data: IDonation[];
  distributionPoints: IDistributionPoint[];
  requesting: boolean;
  onReviewRequest: (id: string, actionType: IActionType) => void;
  onParams: (data: IQueryRequest) => void;
  params: {
    limit: number;
    offset: number;
    total: number;
    tab: DashboardTab;
  };
}

type FlattenedDonation = {
  id: string;
  userId: string;
  requestedProductId: string;
  distributionPointId: string;
  quantity: number;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  distributionPointName: string;
  productName: string;
  unit: string;
  timestamp: number;
};

export function TableManageDonation({
  onParams,
  onReviewRequest,
  params,
  data,
  distributionPoints,
  requesting,
}: ITableManageDonationProps) {
  const dashboardTab = params.tab;

  const filteredDonations: FlattenedDonation[] = React.useMemo(() => {
    const donations = data ?? [];

    return donations.map((donation) => {
      const distributionPoint = distributionPoints.find(
        (p) => p.id === donation.distributionPointId,
      );
      const distributionPointName = distributionPoint?.title ?? "Ponto não informado";

      const product = donation.requestedProduct.product;
      const productName = product?.name ?? "Produto não informado";
      const unit = product?.unit ?? "un";

      const ts = new Date(donation.createdAt).getTime();

      return {
        id: donation.id,
        userId: donation.userId,
        requestedProductId: donation.requestedProductId,
        distributionPointId: donation.distributionPointId,
        quantity: donation.quantity,
        status: donation.status,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt,
        userName: donation.user?.name ?? "Anônimo",
        userEmail: donation.user?.email ?? "Sem email",
        userPhone: donation.user?.phone ?? "Sem telefone",
        distributionPointName,
        productName,
        unit,
        timestamp: ts,
      };
    });
  }, [data, distributionPoints]);

  return (
    <div className="card rounded-2xl bg-base-100 shadow-xl border-t-4 border-primary overflow-hidden">
      <div className="card-body p-0">
        {filteredDonations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-50">
            <IoFilter size={48} className="mb-4 text-base-content/30" />
            <p className="font-medium">Nenhum item encontrado.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto min-h-[400px]">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/50 text-base-content/70 uppercase">
                    <th>Doador</th>
                    <th>Produto / Ponto</th>
                    <th>Quantidade</th>
                    <th>Data</th>
                    <th className="text-center">Status</th>
                    {dashboardTab === "donations" && (
                      <th className="text-right">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            alt={donation.userName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-bold text-sm">
                              {donation.userName || "Anônimo"}
                            </div>
                            <div className="text-xs opacity-50">
                              {donation.userEmail || "Sem email"}
                            </div>
                            <div className="text-xs opacity-50">
                              {donation.userPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="font-medium text-sm">{donation.productName}</div>
                        <div
                          className="text-xs opacity-50 truncate max-w-[200px]"
                          title={donation.distributionPointName}
                        >
                          {donation.distributionPointName}
                        </div>
                      </td>

                      <td className="font-mono text-sm">
                        {donation.quantity}{" "}
                        <span className="text-xs opacity-70">{donation.unit}</span>
                      </td>

                      <td className="text-sm opacity-70">
                        {new Date(donation.timestamp).toLocaleDateString()}
                        <br />
                        <span className="text-xs opacity-50">
                          {new Date(donation.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="text-center">
                        <StatusBadge status={donation.status} />
                      </td>

                      {dashboardTab === "donations" && (
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              onClick={() => onReviewRequest(donation.id, "reject")}
                              styleType="red"
                              className="!rounded-full"
                              icon={<IoClose size={20} />}
                              disabled={requesting}
                            />
                            <ActionButton
                              onClick={() => onReviewRequest(donation.id, "approve")}
                              styleType="green"
                              className="!rounded-full"
                              icon={<IoCheckmark size={20} />}
                              disabled={requesting}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col divide-y divide-base-200">
              {filteredDonations.map((donation) => (
                <div key={donation.id} className="p-4 bg-base-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                        {donation.userName?.charAt(0) || "A"}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{donation.userName}</div>
                        <div className="text-xs opacity-60">{donation.userPhone}</div>
                        <div className="text-[10px] opacity-60 uppercase font-bold tracking-tight">
                          {new Date(donation.timestamp).toLocaleDateString()} às{" "}
                          {new Date(donation.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={donation.status} />
                  </div>

                  <div className="bg-base-200/50 rounded-lg p-3">
                    <div className="text-sm font-bold text-primary">
                      {donation.productName}
                    </div>
                    <div className="text-lg font-mono font-black mt-1">
                      {donation.quantity}{" "}
                      <span className="text-xs font-normal opacity-60">
                        {donation.unit}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-60 flex items-center gap-1 mt-1">
                      <IoMap size={10} /> {donation.distributionPointName}
                    </div>
                  </div>

                  {dashboardTab === "donations" && (
                    <div className="flex gap-2 mt-1">
                      <button
                        disabled={requesting}
                        onClick={() => onReviewRequest(donation.id, "reject")}
                        className="btn btn-sm btn-outline btn-error flex-1 rounded-lg"
                      >
                        <IoMdClose size={16} /> Recusar
                      </button>
                      <button
                        disabled={requesting}
                        onClick={() => onReviewRequest(donation.id, "approve")}
                        className="btn btn-sm btn-success text-white flex-1 rounded-lg"
                      >
                        <IoMdCheckmark size={16} /> Confirmar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <TablePagination onParams={onParams} params={params} />
          </>
        )}
      </div>
    </div>
  );
}
