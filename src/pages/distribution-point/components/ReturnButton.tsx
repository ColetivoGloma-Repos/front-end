import { IoMdArrowBack } from "react-icons/io";

interface IReturnButtonProps {
  onClick?: () => void;
  className?: string;
}

export function ReturnButton({ onClick, className }: IReturnButtonProps) {
  return (
    <button
      onClick={() => onClick?.()}
      className={`btn rounded-lg btn-ghost btn-sm pl-0 max-lg:pr-0 ${className}`}
    >
      <IoMdArrowBack size={20} className="mx-2" />
      <span className="max-lg:hidden">Voltar</span>
    </button>
  );
}
