import { useMemo } from "react";

interface IAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
};

export function Avatar({ src, alt = "", className = "" }: IAvatarProps) {
  const hasSrc = !!src;

  const backgroundColor = useMemo(() => stringToColor(alt || "?"), [alt]);

  return (
    <div className={`avatar ${!hasSrc ? "placeholder" : ""}`}>
      <div
        className={`size-8 rounded-full ${className}`}
        style={!hasSrc ? { backgroundColor, color: "#fff" } : undefined}
      >
        {hasSrc ? (
          <img src={src || ""} alt={alt} />
        ) : (
          <span className="font-semibold text-sm">
            {alt?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
    </div>
  );
}
