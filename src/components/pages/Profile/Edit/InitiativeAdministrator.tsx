type CoordinatorRequestProps = {
  onRequest: () => void;
};

export default function ToRequireinitiativeAdministrator({ onRequest }: CoordinatorRequestProps) {
  return (
    <div className="w-[100%] max-w-lg mx-auto">
      <h2 className="text-gray-800 text-xl font-semibold mb-3">
        Deseja tornar-se um administrador de inicitaiva ?
      </h2>
      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
        Caso você seja um coordenador e possuir abrigos, pode solicitar tornar-se um administrador de iniciativa onde pode gerencia coordenadores e abrigos.
      </p>
      <button
        onClick={onRequest}
        className="w-full px-5 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        Solicitar tornar-se administrador de iniciativa
      </button>
    </div>
  );
}
