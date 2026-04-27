import { IoTime, IoCheckmark, IoClose, IoPricetagOutline } from "react-icons/io5";
import {
  DonationStatus,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point";

export function StatusBadge({ status }: { status: any }) {
  switch (status) {
    case DonationStatus.ACTIVE:
      return (
        <div className="badge badge-warning gap-1 rounded-full">
          <IoTime size={10} /> Em andamento
        </div>
      );

    case DonationStatus.DELIVERED:
      return (
        <div className="badge badge-success text-white gap-1 rounded-full">
          <IoCheckmark size={10} /> Entregue
        </div>
      );

    case DonationStatus.CANCELED:
      return (
        <div className="badge badge-error text-white gap-1 rounded-full">
          <IoClose size={10} /> Cancelado
        </div>
      );

    case RequestedProductStatus.DELIVERED:
      return (
        <div className="badge badge-success text-white gap-1 rounded-full">
          <IoCheckmark size={10} /> Entregue
        </div>
      );

    case RequestedProductStatus.OPEN:
      return (
        <div className="badge badge-primary badge-outline gap-1 rounded-full">
          <IoPricetagOutline size={10} /> Aberto
        </div>
      );

    case RequestedProductStatus.FULL:
      return (
        <div className="badge badge-warning badge-outline gap-1 rounded-full">
          <IoPricetagOutline size={10} /> Cheio
        </div>
      );

    default:
      return (
        <div className="badge badge-neutral badge-outline gap-1 rounded-full">
          <IoPricetagOutline size={10} /> {String(status)}
        </div>
      );
  }
}
