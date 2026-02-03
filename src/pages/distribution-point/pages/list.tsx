import React from "react";
import { IoMdAdd, IoMdPin } from "react-icons/io";
import { formatAddress } from "../../../utils";
import { useDistributionPointProvider } from "../context";
import { useNavigate } from "react-router-dom";
import { Button, Loading } from "../../../components/common";
import useInView from "../../../hooks/useInView";

export default function ListDistributionPoint() {
  const navigation = useNavigate();

  const {
    distributionPoints,
    onListDistributionPoints,
    isAdmin,
    isLoggedIn,
    total,
    isLoading,
    pagination,
    setPagination,
  } = useDistributionPointProvider();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  React.useEffect(() => {
    if (distributionPoints.length === 0) {
      onListDistributionPoints({
        limit: String(pagination.limit),
        offset: String(0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (inView && !isLoading && distributionPoints.length < total) {
      const newOffset = pagination.offset + pagination.limit;
      setPagination((prev) => ({ ...prev, offset: newOffset }));
      onListDistributionPoints({
        limit: String(pagination.limit),
        offset: String(newOffset),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const navigateToDetail = (id: string) => {
    navigation(`/distribution-point/${id}`);
  };

  const navigateToCreate = () => {
    navigation(`/distribution-point/create`);
  };

  const navigateToManage = () => {
    navigation(`/distribution-point/manage`);
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-base-content">
            Pontos de Distribuição
          </h2>
          <p className="text-base-content/70 mt-1">
            Selecione um local para visualizar necessidades ou doar.
          </p>
        </div>
        {isAdmin && isLoggedIn && (
          <div className="flex gap-2">
            <Button
              className="btn btn-primary text-white !rounded-lg hover:!bg-blue-800"
              onClick={navigateToCreate}
              text={
                <>
                  <IoMdAdd size={20} />
                  Novo Ponto
                </>
              }
            />
            <Button
              className="btn btn-primary text-white !rounded-lg hover:!bg-blue-800"
              onClick={navigateToManage}
              text="Gerenciar Doações"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {distributionPoints.map((distributionPoint) => {
          const hasImages =
            distributionPoint.images && distributionPoint.images.length > 0;
          const bgImage = hasImages
            ? distributionPoint.images![0]
            : "https://placehold.co/600x400/e2e8f0/475569?text=Sem+Imagem";

          return (
            <div
              key={distributionPoint.id}
              onClick={() => navigateToDetail(distributionPoint.id)}
              className="card rounded-2xl bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
            >
              <figure className="h-40 relative">
                <img
                  src={bgImage}
                  alt={distributionPoint.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {distributionPoint.isFullyStocked && (
                  <div className="absolute top-2 right-2 badge badge-success text-white shadow-md">
                    Abastecido
                  </div>
                )}
              </figure>
              <div className="card-body">
                <h3 className="card-title text-lg group-hover:text-primary transition-colors">
                  {distributionPoint.title}
                </h3>
                <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                  {distributionPoint.description}
                </p>
                <div className="flex items-center text-base-content/50 text-xs mb-4">
                  <IoMdPin size={14} className="mr-1" />
                  {formatAddress(distributionPoint.address)}
                </div>

                <div className="divider my-1"></div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-base-content/70">
                    {distributionPoint.requestedProducts} tipos de produtos
                  </span>
                  <span className="text-primary font-bold flex items-center text-xs">
                    Ver detalhes &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isLoading && (
        <div className="w-full flex justify-center py-4">
          <Loading />
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
