import React from "react";

type CoordinatorRequestProps = {
  onRequest: () => void;
};

export default function CooridnatorRequest({ onRequest }: CoordinatorRequestProps) {
  return (
    <div className="w-[100%] max-w-lg mx-auto">
      <h2 className="text-gray-800 text-xl font-semibold mb-3">
        Deseja tornar-se coordenador?
      </h2>
      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
        Coordenador é quem gerencia abrigos e pontos de distribuição. Você pode solicitar para tornar-se um, porém estará sujeito à aprovação dos administradores.
      </p>
      <button
        onClick={onRequest}
        className="w-full px-5 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        Solicitar coordenação
      </button>
    </div>
  );
}
