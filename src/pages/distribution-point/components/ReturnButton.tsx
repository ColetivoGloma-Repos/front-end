import { IoMdArrowBack } from "react-icons/io";

interface IReturnButtonProps {
  onClick: () => {};
}

export function ReturnButton({ onClick }: IReturnButtonProps) {
  return (
    <button onClick={onClick} className="btn rounded-lg btn-ghost btn-sm pl-0">
      <IoMdArrowBack size={20} className="mx-2" /> Voltar
    </button>
  );
}
