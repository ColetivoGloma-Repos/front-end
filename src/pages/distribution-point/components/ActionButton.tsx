import { ButtonHTMLAttributes } from "react";

interface IActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  styleType: "red" | "blue" | "green";
  icon: React.ReactNode;
}

export function ActionButton({
  styleType = "blue",
  type = "button",
  ...props
}: IActionButtonProps) {
  const baseClasses = "btn btn-sm btn-circle btn-ghost size-8";

  const styleClasses = {
    red: "text-error !bg-error/15 hover:!bg-error/30",
    blue: "text-info !bg-info/15 hover:!bg-info/30",
    green: "text-success !bg-success/15 hover:!bg-success/30",
  };
  const styleClass = styleClasses[styleType] || styleClasses.blue;

  return (
    <button
      {...props}
      type={type}
      className={`${baseClasses} ${styleClass} ${props.className || ""}`}
    >
      {props.icon}
    </button>
  );
}
