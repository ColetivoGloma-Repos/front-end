import { IoMdMap } from "react-icons/io";

interface LocationMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

export function LocationMap({ coordinates, address }: LocationMapProps) {
  const mapUrl = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`;

  return (
    <div className="card rounded-2xl bg-base-100 shadow-xl overflow-hidden h-fit">
      <div className="h-56 w-full bg-base-200 relative">
        <iframe
          title="Location Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={mapUrl}
          className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="card-body p-4">
        <h3 className="font-bold text-sm uppercase text-base-content/50 flex items-center gap-2 mb-2">
          <IoMdMap className="text-base-content/60" size={18} />
          Localização
        </h3>
        <p className="text-sm font-medium leading-snug">{address}</p>
      </div>
    </div>
  );
}
