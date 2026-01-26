import React from "react";
import { IDistributionPoint } from "../../../interfaces/distribution-point/distriuition-points";
import {
  ICreateProductRequestedProduct,
  IRequestedProduct,
  IUpdateRequestedProduct,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point/point-requested-product";
import { formatAddress } from "../../../utils";
import { LocationMap, MetricsChart, RequestedProductCard } from "../components";
import { IoMdArrowBack, IoMdCreate, IoMdCall, IoMdAdd } from "react-icons/io";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select } from "../../../components/common";
import { UnitType } from "../../../interfaces/products";
import { useNavigate, useParams } from "react-router-dom";
import { useDistributionPointProvider } from "../context";
import {
  cancelAllDonation,
  createDonation,
  createRequestedProduct,
  deleteRequestedProduct,
  listDonations,
  listOneDistributionPoint,
  listRequestedProduct,
  listRequestedProducts,
  updateRequestedProduct,
} from "../../../services/distribution-point";
import { DonationStatus } from "../../../interfaces/distribution-point";
import { useAuthProvider } from "../../../context/Auth";
import { toast } from "react-toastify";

const addProductSchema = z.object({
  name: z.string().trim().min(1, "Nome do produto é obrigatório"),
  requestedQuantity: z.coerce
    .number({
      invalid_type_error: "Qtd deve ser um número",
      required_error: "Qtd é obrigatória",
    })
    .int("Qtd deve ser um número inteiro")
    .positive("Qtd deve ser maior que zero"),
  unit: z.enum(["UN", "KG", "G", "L", "ML"], {
    required_error: "Unidade é obrigatória",
    invalid_type_error: "Unidade inválida",
  }),
});

type AddProductFormValues = z.infer<typeof addProductSchema>;

interface IState {
  distributionPoint?: IDistributionPoint;
  requestedProducts: IRequestedProduct[];
  donations: { [key: string]: number };
}

export default function DetailDistributionPoint() {
  const navigation = useNavigate();
  const { id = "" } = useParams();
  const { currentUser } = useAuthProvider();
  const { isAdmin, isLoggedIn } = useDistributionPointProvider();

  const [{ donations, distributionPoint, requestedProducts }, setState] =
    React.useState<IState>({
      distributionPoint: undefined,
      requestedProducts: [],
      donations: {},
    });

  React.useEffect(() => {
    onDistributionPointLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.id]);

  const onDistributionPointLoad = async () => {
    try {
      const data = await listOneDistributionPoint(id || "");
      setState((prev) => ({ ...prev, distributionPoint: data }));

      await Promise.all([onRequestedProductsLoad(), onDonationsLoad()]);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar informações do ponto de distribuição.");
    }
  };

  const onRequestedProductsLoad = async () => {
    try {
      const requestedProducts = await listRequestedProducts(id || "");
      setState((prev) => ({ ...prev, requestedProducts: requestedProducts.items || [] }));
    } catch (error) {
      console.error(error);
    }
  };

  const onDonationsLoad = async () => {
    try {
      const donations = await listDonations({
        distributionPointId: id || "",
        status: DonationStatus.ACTIVE,
        limit: "100",
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

  const navigateToList = () => {
    navigation("/");
  };

  const navigateToEdit = () => {
    navigation(`/distribution-point/${id}/edit`);
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

  const handleDonate = async (requestedProductId: string, quantity: number) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 3000));
    const donationResponse = await createDonation({
      requestedProductId,
      quantity,
    }).catch((error) => {
      console.error(error);
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
      .catch((error) => {
        console.error(error);
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
    await updateRequestedProduct(requestedProductId, updates).catch((error) => {
      console.error(error);
      return null;
    });

    await fetchRequestedProduct(requestedProductId);
  };

  const handleAdminDeleteProduct = async (requestedProductId: string) => {
    try {
      await deleteRequestedProduct(requestedProductId);
      setState((prev) => ({
        ...prev,
        requestedProducts: prev.requestedProducts.filter(
          (product) => product.id !== requestedProductId,
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdminAddProductToExisting = async (
    distributionPointId: string,
    payload: AddProductFormValues,
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
    } catch (error) {
      console.error(error);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductSchema),
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

  if (!distributionPoint) return null;

  const hasImages = distributionPoint.images && distributionPoint.images?.length > 0;

  return (
    <div className="py-8">
      <button
        onClick={navigateToList}
        className="btn rounded-lg btn-ghost btn-sm mb-6 pl-0"
      >
        <IoMdArrowBack size={20} className="mx-2" /> Voltar
      </button>

      {hasImages && (
        <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-xl mb-8 relative">
          <img
            src={distributionPoint.images![0]}
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

                {isAdmin && isLoggedIn && (
                  <button
                    onClick={navigateToEdit}
                    className="btn rounded-lg btn-sm btn-ghost text-info bg-info/10 hover:bg-info/20"
                    title="Editar Ponto"
                  >
                    <IoMdCreate size={16} /> Editar Info
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <IoMdCall size={16} />
                <span>{distributionPoint.phone}</span>
              </div>

              <p className="text-base-content/70 italic">
                "{distributionPoint.description}"
              </p>

              {isAdmin && isLoggedIn && (
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
              requestedProducts.map((requestedProduct) => (
                <RequestedProductCard
                  key={requestedProduct.id}
                  requestedProduct={requestedProduct}
                  isAdmin={isAdmin && isLoggedIn}
                  isLoggedIn={isLoggedIn}
                  userDonatedAmount={donations[requestedProduct.id]}
                  onDonate={(amount) => handleDonate(requestedProduct.id, amount)}
                  onCancelDonation={() => handleCancelDonation(requestedProduct.id)}
                  onEdit={(updates) =>
                    handleAdminUpdateProduct(requestedProduct.id, updates)
                  }
                  onDelete={() => handleAdminDeleteProduct(requestedProduct.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
