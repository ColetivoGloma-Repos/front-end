import React from "react";
import { IDistributionPoint } from "../../../interfaces/distribution-point/distriuition-points";
import {
  ICreateProductRequestedProduct,
  IRequestedProduct,
  IUpdateRequestedProduct,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point/point-requested-product";
import { formatAddress } from "../../../utils";
import {
  LocationMap,
  MetricsChart,
  RequestedProductCard,
  ReturnButton,
  DetailPageSkeleton,
} from "../components";
import { IoMdCreate, IoMdCall, IoMdAdd } from "react-icons/io";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select } from "../../../components/common";
import { UnitType } from "../../../interfaces/products";
import { useNavigate, useParams } from "react-router-dom";
import { useDistributionPointProvider } from "../context";
import {
  cancelAllDonation,
  createDonation,
  createRequestedProduct,
  cancelRequestedProduct,
  listDonations,
  listOneDistributionPoint,
  listRequestedProduct,
  listRequestedProducts,
  updateRequestedProduct,
  listCoordinators,
} from "../../../services/distribution-point";
import { DonationCollectionType, DonationStatus } from "../../../interfaces/distribution-point";
import { toast } from "react-toastify";
import { upsertRequestedProductSchema } from "../validations/upsert-requested-product";
import { useAuthProvider } from "../../../context/Auth";
import { integerMask, phoneMask } from "../../../utils/masks";
import { Loading } from "../../../components/common";
import useInView from "../../../hooks/useInView";
import { ROUTES } from "../routes";

const LIMIT = 10;

interface IAddProductFormValues {
  name: string;
  requestedQuantity: number;
  unit: UnitType;
}

interface IState {
  distributionPoint?: IDistributionPoint;
  requestedProducts: IRequestedProduct[];
  donations: { [key: string]: number };
  isLoading: boolean;
  page: number;
  total: number;
  coordinators: any[];
}

export default function DetailDistributionPoint() {
  const navigation = useNavigate();
  const { id = "" } = useParams();
  const { currentUser } = useAuthProvider();
  const { isAdmin, isCoordinator, isLoggedIn } = useDistributionPointProvider();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [
    {
      donations,
      distributionPoint: _distributionPoint,
      requestedProducts,
      isLoading,
      page,
      total,
      coordinators,
    },
    setState,
  ] = React.useState<IState>({
    distributionPoint: undefined,
    requestedProducts: [],
    donations: {},
    isLoading: true,
    page: 0,
    total: 0,
    coordinators: [],
  });

  React.useEffect(() => {
    let mounted = false;
    if (mounted) return;

    onDistributionPointLoad(isLoggedIn);

    return () => {
      mounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoggedIn]);

  React.useEffect(() => {
    if (inView && requestedProducts.length < total) {
      onRequestedProductsLoad(isLoggedIn, page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const onDistributionPointLoad = async (isLoggedIn: boolean) => {
    try {
      const data = await listOneDistributionPoint(id || "");
      await onRequestedProductsLoad(isLoggedIn, 0);
      await onCoordinatorsLoad(data.id, data.owner);

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          distributionPoint: data,
          isLoading: false,
        }));
      }, 150);
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message || "Erro ao carregar informações do ponto de distribuição.",
      );

      navigation(ROUTES.list);
    }
  };

  const onRequestedProductsLoad = async (isLoggedIn: boolean, page = 0) => {
    try {
      const response = await listRequestedProducts({
        distributionPointId: id,
        limit: String(LIMIT),
        offset: String(page * LIMIT),
      });

      setState((prev) => ({
        ...prev,
        requestedProducts:
          page === 0
            ? response.items || []
            : [...prev.requestedProducts, ...(response.items || [])],
        page,
        total: response.total,
      }));

      await onDonationsLoad(isLoggedIn);
    } catch (error) {
      console.error(error);
    }
  };

  const onDonationsLoad = async (isLoggedIn: boolean) => {
    if (!isLoggedIn) return;

    try {
      const donations = await listDonations({
        distributionPointId: id || "",
        status: DonationStatus.ACTIVE,
        limit: "1000",
      });
      const donationsByProduct: { [key: string]: number } = {};
      donations.items.forEach((donation) => {
        if (!donationsByProduct[donation.requestedProductId]) {
          donationsByProduct[donation.requestedProductId] = 0;
        }
        donationsByProduct[donation.requestedProductId] += donation.quantity;
      });
      setState((prev) => ({ ...prev, donations: donationsByProduct }));
    } catch (error) {
      console.error(error);
    }
  };

  const onCoordinatorsLoad = async (distributionPointId: string, owner?: any) => {
    try {
      const response = await listCoordinators(distributionPointId);
      const coordsWithVehicle = (response.coordinators || []).map((coord) => ({
        ...coord,
        hasVehicle: coord.owner?.hasVehicle,
      }));
      
      const ownerCoordinator = owner ? {
        id: owner.id,
        name: owner.name,
        phone: owner.phone,
        hasVehicle: owner.hasVehicle,
      } : null;

      const allCoordinators = ownerCoordinator ? [ownerCoordinator, ...coordsWithVehicle] : coordsWithVehicle;
      setState((prev) => ({ ...prev, coordinators: allCoordinators }));
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToList = () => {
    navigation(ROUTES.list);
  };

  const navigateToEdit = () => {
    navigation(ROUTES.edit(id));
  };

  const fetchRequestedProduct = async (
    requestedProductId: string,
    isNew: boolean = false,
  ) => {
    const requestedProductResponse = await listRequestedProduct(requestedProductId).catch(
      (error) => {
        console.error(error);
        return null;
      },
    );

    if (requestedProductResponse) {
      setState((prev) => ({
        ...prev,
        requestedProducts: isNew
          ? [requestedProductResponse, ...prev.requestedProducts]
          : prev.requestedProducts.map((requestedProduct) =>
              requestedProduct.id === requestedProductId
                ? { ...requestedProduct, ...requestedProductResponse }
                : requestedProduct,
            ),
      }));
    }

    return requestedProductResponse;
  };

  const handleDonate = async (
    requestedProductId: string,
    quantity: number,
    collectionType: DonationCollectionType,
  ) => {
    const donationResponse = await createDonation({
      requestedProductId,
      quantity,
      collectionType,
    }).catch((e) => {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message || "Erro ao realizar a doação. Tente novamente mais tarde.",
      );
      return null;
    });

    if (donationResponse) {
      setState((prev) => ({
        ...prev,
        donations: {
          ...prev.donations,
          [requestedProductId]: (prev.donations[requestedProductId] || 0) + quantity,
        },
      }));
    }

    await fetchRequestedProduct(requestedProductId);
  };

  const handleCancelDonation = async (requestedProductId: string) => {
    const donationResponse = await cancelAllDonation(requestedProductId || "")
      .then(() => true)
      .catch((e) => {
        const error = e as Error;
        console.error(error);

        toast.error(
          error.message || "Erro ao cancelar a doação. Tente novamente mais tarde.",
        );
        return false;
      });

    if (donationResponse) {
      setState((prev) => ({
        ...prev,
        donations: {
          ...prev.donations,
          [requestedProductId]: 0,
        },
      }));
    }

    await fetchRequestedProduct(requestedProductId);
  };

  const handleAdminUpdateProduct = async (
    requestedProductId: string,
    updates: IUpdateRequestedProduct,
  ) => {
    let capturedError: Error | null = null;

    await updateRequestedProduct(requestedProductId, updates).catch((err) => {
      console.error("Error no Update Requested Product", err);
      capturedError = err as Error;
      return null;
    });

    await fetchRequestedProduct(requestedProductId);

    if (capturedError) {
      throw capturedError;
    }
  };

  const handleAdminDeleteProduct = async (requestedProductId: string) => {
    try {
      await cancelRequestedProduct(requestedProductId);
      setState((prev) => ({
        ...prev,
        requestedProducts: prev.requestedProducts.filter(
          (product) => product.id !== requestedProductId,
        ),
      }));
    } catch (e) {
      const error = e as Error;
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao deletar o produto solicitado. Tente novamente mais tarde.",
      );
    }
  };

  const handleAdminAddProductToExisting = async (
    distributionPointId: string,
    payload: IAddProductFormValues,
  ) => {
    try {
      const requestedProducts = await createRequestedProduct({
        distributionPointId,
        requestedProducts: [payload as ICreateProductRequestedProduct],
      });
      const requestedProductId = requestedProducts[0].id;

      await fetchRequestedProduct(requestedProductId, true);

      reset({
        name: "",
        requestedQuantity: 1,
        unit: UnitType.UN,
      });
    } catch (e) {
      const error = e as Error & { statusCode: number };
      console.error(error);

      const status = error.statusCode;
      if (status === 409) {
        toast.error("Já existe um produto solicitado com esse nome.");
        return;
      }

      toast.error(
        error.message ||
          "Erro ao adicionar o produto solicitado. Tente novamente mais tarde.",
      );
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<IAddProductFormValues>({
    resolver: zodResolver(upsertRequestedProductSchema(false)),
    defaultValues: {
      name: "",
      requestedQuantity: 1,
      unit: UnitType.UN,
    },
    mode: "onSubmit",
  });

  const watchedName = watch("name");
  const watchedQuantity = watch("requestedQuantity");

  const unitOptions = React.useMemo(
    () =>
      Object.values(UnitType).map((u) => ({
        label: u,
        value: u,
      })),
    [],
  );

  if (isLoading && !_distributionPoint) {
    return <DetailPageSkeleton />;
  }
  const distributionPoint = _distributionPoint!;

  const isOnwer = isCoordinator && distributionPoint.ownerId === currentUser?.id;

  const latestFile =
    distributionPoint.files && distributionPoint.files.length > 0
      ? [...distributionPoint.files].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      : null;
  const hasImages = !!latestFile?.url;

  return (
    <div className="py-8">
      {!hasImages && <ReturnButton onClick={navigateToList} className="mb-6" />}

      {hasImages && (
        <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-xl mb-8 relative">
          <ReturnButton
            onClick={navigateToList}
            className="ml-2 mt-4 absolute top-0 left-0 z-10 text-white"
          />

          <img
            src={latestFile?.url}
            alt={distributionPoint.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <h1 className="text-4xl font-bold text-white shadow-black drop-shadow-md">
              {distributionPoint.title}
            </h1>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <LocationMap
            coordinates={{
              lat: distributionPoint?.address?.latitude || 0,
              lng: distributionPoint?.address?.longitude || 0,
            }}
            address={formatAddress(distributionPoint.address)}
          />

          <div className="card rounded-2xl bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start">
                {!hasImages && (
                  <h2 className="card-title text-2xl">{distributionPoint.title}</h2>
                )}

                {(isOnwer || isAdmin) && isLoggedIn && (
                  <button
                    onClick={navigateToEdit}
                    className="btn rounded-lg btn-sm btn-ghost text-info bg-info/10 hover:bg-info/20 ml-auto"
                    title="Editar Ponto"
                  >
                    <IoMdCreate size={16} /> Editar Info
                  </button>
                )}
              </div>          

              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <IoMdCall size={16} />
                <span>{phoneMask(distributionPoint.phone)}</span>
              </div>

              <p className="text-base-content/70 italic">
                "{distributionPoint.description}"
              </p>

              <div className="mt-6">              
                  <h3 className="font-bold text-lg mb-4 text-base-content">
                    Coordenadores
                  </h3>
                  <div className="space-y-3">
                    {coordinators && coordinators.length > 0 ? (
                      coordinators.map((coordinator) => (
                        <div key={coordinator.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span className="text-sm font-bold">{coordinator.name?.charAt(0) || '?'}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{coordinator.name || 'Coordenador'}</p>
                            <p className="text-xs text-base-content/60">Coordenador</p>
                            <p className="text-xs text-primary">{coordinator.phone || 'Sem telefone'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <p>Possui veículo ?</p>
                            <span className={`badge ${coordinator.hasVehicle ? 'badge-success' : 'badge-error'}`}>
                              {coordinator.hasVehicle ? 'Sim' : 'Não'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info rounded-lg">
                        <span className="text-sm">Nenhum coordenador vinculado a este ponto.</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigation(`/distribution-point/${id}/coordinators`)}
                    className="btn btn-sm btn-ghost w-full mt-2 text-primary"
                  >
                    Ver mais coordenadores
                  </button>
              </div>

              {(isOnwer || isAdmin) && isLoggedIn && (
                <>
                  <div className="divider">Admin</div>

                  <form
                    className="bg-base-200 p-4 rounded-lg space-y-3"
                    onSubmit={handleSubmit(async (values) => {
                      handleAdminAddProductToExisting(distributionPoint.id, values);
                    })}
                  >
                    <h4 className="font-bold text-sm text-base-content/70 uppercase">
                      Adicionar Produto
                    </h4>

                    <Input
                      label="Nome do Produto"
                      placeholder="Nome do Produto"
                      className="input-sm h-9 !rounded-lg bg-white"
                      errors={errors}
                      required
                      {...register("name")}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Qtd"
                        type="number"
                        placeholder="Qtd"
                        containerClassName="col-span-2"
                        className="input-sm h-9 !rounded-lg bg-white"
                        errors={errors}
                        required
                        mask={integerMask}
                        {...register("requestedQuantity")}
                      />

                      <Select
                        label="Unidade"
                        className="select-sm h-9 !rounded-lg bg-white"
                        options={unitOptions}
                        errors={errors}
                        required
                        {...register("unit")}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn rounded-lg btn-primary w-full btn-sm text-white"
                      disabled={!watchedName || !watchedQuantity || isSubmitting}
                    >
                      <IoMdAdd size={16} /> Solicitar Novo Produto
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <MetricsChart requestedProducts={requestedProducts} />
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Itens Solicitados
              <div className="badge badge-neutral rounded-2xl">
                {
                  requestedProducts.filter(
                    (p) => p.status === RequestedProductStatus.OPEN,
                  ).length
                }{" "}
                pendentes
              </div>
            </h3>
          </div>

          <div className="space-y-4">
            {requestedProducts.length === 0 ? (
              <div className="alert rounded-lg">
                <span className="text-base-content/60">
                  Nenhum produto solicitado para este ponto ainda.
                </span>
              </div>
            ) : (
              <>
                {requestedProducts.map((requestedProduct) => (
                  <RequestedProductCard
                    key={requestedProduct.id}
                    requestedProduct={requestedProduct}
                    isAdmin={(isOnwer || isAdmin) && isLoggedIn}
                    isLoggedIn={isLoggedIn}
                    userDonatedAmount={donations[requestedProduct.id]}
                    onDonate={(amount, collectionType) => handleDonate(requestedProduct.id, amount, collectionType)}
                    onCancelDonation={() => handleCancelDonation(requestedProduct.id)}
                    onEdit={(updates) =>
                      handleAdminUpdateProduct(requestedProduct.id, updates)
                    }
                    onDelete={() => handleAdminDeleteProduct(requestedProduct.id)}
                  />
                ))}

                {requestedProducts.length < total && (
                  <div ref={ref} className="w-full flex justify-center py-4">
                    <Loading className="loading-md text-primary" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
