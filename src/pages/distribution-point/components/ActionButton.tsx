import { Button } from "../../../components/common";

export function ActionButton({
  type = "blue",
  ...props
}: {
  onClick: () => void;
  type: "red" | "blue" | "green";
  disabled?: boolean;
  className?: string;
  icon: React.ReactNode;
}) {
  const baseClasses = "btn btn-sm btn-circle btn-ghost size-8";

  const styleClasses = {
    red: "text-error !bg-error/15 hover:!bg-error/30",
    blue: "text-info !bg-info/15 hover:!bg-info/30",
    green: "text-success !bg-success/15 hover:!bg-success/30",
  };
  const styleClass = styleClasses[type] || styleClasses.blue;

  return (
    <button
      {...props}
      type="button"
      className={`${baseClasses} ${styleClass} ${props.className || ""}`}
    >
      {props.icon}
    </button>
  );
}
