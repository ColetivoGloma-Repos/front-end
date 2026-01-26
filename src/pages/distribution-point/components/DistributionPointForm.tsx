import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IoMdArrowBack,
  IoMdPin,
  IoMdBulb,
  IoMdAdd,
  IoMdTrash,
  IoMdSave,
} from "react-icons/io";
import { Input, Select, Textarea } from "../../../components/common";
import { UnitType } from "../../../interfaces/products";
import { toast } from "react-toastify";
import {
  ICreateDistributionPoint,
  IDistributionPoint,
} from "../../../interfaces/distribution-point";
import {
  createDistributionPoint,
  updateDistributionPoint,
} from "../../../services/distribution-point";

interface IDistributionPointFormProps {
  isEditMode: boolean;
  data?: IDistributionPoint;
  navigationCallback?: () => void;
  saveOrEditCallback?: (data: IDistributionPoint, distributionPointId?: string) => void;
}

function buildSchema(isEditMode: boolean) {
  const base = z.object({
    title: z.string().trim().min(1, "Nome do ponto é obrigatório"),
    phone: z.string().trim().min(1, "Telefone é obrigatório"),
    description: z.string().trim().min(1, "Descrição é obrigatória"),
    address: z.object({
      cep: z
        .string()
        .trim()
        .optional()
        .transform((v) => v ?? ""),
      pais: z.string().trim().min(1, "País é obrigatório"),
      estado: z
        .string()
        .trim()
        .min(2, "UF inválida")
        .max(2, "UF inválida")
        .transform((v) => v.toUpperCase()),
      municipio: z.string().trim().min(1, "Município é obrigatório"),
      bairro: z.string().trim().min(1, "Bairro é obrigatório"),
      logradouro: z.string().trim().min(1, "Logradouro é obrigatório"),
      numero: z.string().trim().min(1, "Número é obrigatório"),
      complemento: z
        .string()
        .trim()
        .optional()
        .transform((v) => v ?? ""),
    }),
    requestedProducts: z.array(
      z.object({
        name: z.string().trim().min(1, "Nome do produto é obrigatório"),
        requestedQuantity: z.coerce
          .number({
            invalid_type_error: "Qtd deve ser um número",
            required_error: "Qtd é obrigatória",
          })
          .positive("Qtd deve ser maior que zero"),
        unit: z.nativeEnum(UnitType).optional(),
      }),
    ),
  });

  if (isEditMode) {
    return base.extend({
      requestedProducts: base.shape.requestedProducts
        .optional()
        .transform((v) => v ?? []),
    });
  }

  return base.superRefine((val, ctx) => {
    if (!val.requestedProducts || val.requestedProducts.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requestedProducts"],
        message: "Adicione pelo menos 1 produto",
      });
    }
  });
}

export function DistributionPointForm({
  data,
  isEditMode = false,
  saveOrEditCallback,
  navigationCallback,
}: IDistributionPointFormProps) {
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");

  const schema = React.useMemo(() => buildSchema(isEditMode), [isEditMode]);

  const defaultValues: ICreateDistributionPoint = React.useMemo(
    () => ({
      title: data?.title || "",
      description: data?.description || "",
      phone: data?.phone || "",
      address: {
        cep: data?.address.cep || "",
        pais: data?.address.pais || "Brasil",
        estado: data?.address.estado || "",
        municipio: data?.address.municipio || "",
        bairro: data?.address.bairro || "",
        logradouro: data?.address.logradouro || "",
        numero: data?.address.numero || "",
        complemento: data?.address.complemento || "",
      },
      requestedProducts: [],
    }),
    [data],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ICreateDistributionPoint>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requestedProducts",
  });

  const unitOptions = React.useMemo(
    () =>
      Object.values(UnitType).map((u) => ({
        label: u,
        value: u,
      })),
    [],
  );

  const watchedTitle = watch("title");
  const watchedLogradouro = watch("address.logradouro");
  const watchedRequestedProducts = watch("requestedProducts");

  const generateSuggestions = async () => {
    const description = getValues("description");
    if (!description) return;

    setIsGeneratingAI(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      append({ name: "Água mineral", requestedQuantity: 20, unit: UnitType.UN });
      append({ name: "Cesta básica", requestedQuantity: 10, unit: UnitType.UN });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreatePoint = async (values: ICreateDistributionPoint) => {
    try {
      const response = await createDistributionPoint(values);
      if (saveOrEditCallback) {
        saveOrEditCallback(response);
      }
      navigationCallback?.();
    } catch (error) {
      console.error("Erro ao criar ponto de distribuição:", error);
      toast.error("Erro ao criar ponto de distribuição. Tente novamente mais tarde.");
    }
  };

  const handleSaveEdit = async (values: ICreateDistributionPoint) => {
    if (!data?.id) return;
    const id = data.id;

    try {
      const response = await updateDistributionPoint(id, values);
      if (saveOrEditCallback) {
        saveOrEditCallback(response, id);
      }
      navigationCallback?.();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast.error("Erro ao salvar alterações. Tente novamente mais tarde.");
    }
  };

  const onSubmit = async (values: ICreateDistributionPoint) => {
    if (isEditMode) {
      await handleSaveEdit(values);
      return;
    }

    await handleCreatePoint(values);
  };

  return (
    <div className="py-8">
      <button
        onClick={navigationCallback}
        className="btn rounded-lg btn-ghost btn-sm mb-6 pl-0"
        type="button"
      >
        <IoMdArrowBack size={20} className="mx-2" /> Voltar
      </button>

      <div className="card rounded-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">
            {isEditMode ? "Editar Ponto de Distribuição" : "Novo Ponto de Distribuição"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome do Ponto"
                  type="text"
                  placeholder="Ex: Centro Comunitário Norte"
                  className="w-full"
                  errors={errors}
                  required
                  {...register("title")}
                />

                <Input
                  label="Telefone de Contato"
                  type="text"
                  placeholder="(00) 00000-0000"
                  className="w-full"
                  errors={errors}
                  required
                  {...register("phone")}
                />
              </div>

              <div className="bg-base-200 p-4 rounded-lg space-y-4">
                <label className="label pt-0 pb-0">
                  <span className="label-text font-bold text-lg flex items-center gap-2">
                    <IoMdPin size={16} /> Endereço e Localização
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <Input
                    label="CEP"
                    type="text"
                    placeholder="40000-000"
                    className="input-sm w-full"
                    errors={errors}
                    {...register("address.cep")}
                  />

                  <Input
                    label="País"
                    type="text"
                    className="input-sm w-full"
                    errors={errors}
                    required
                    {...register("address.pais")}
                  />

                  <Input
                    label="Estado (UF)"
                    type="text"
                    placeholder="BA"
                    className="input-sm w-full"
                    errors={errors}
                    required
                    maxLength={2}
                    {...register("address.estado", {
                      onChange: (event) =>
                        setValue(
                          "address.estado",
                          String(event.target.value || "").toUpperCase(),
                        ),
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    label="Município"
                    type="text"
                    placeholder="Salvador"
                    className="input-sm w-full"
                    errors={errors}
                    required
                    {...register("address.municipio")}
                  />

                  <Input
                    label="Bairro"
                    type="text"
                    placeholder="Centro"
                    className="input-sm w-full"
                    errors={errors}
                    required
                    {...register("address.bairro")}
                  />
                </div>

                <Input
                  label="Logradouro"
                  type="text"
                  placeholder="Rua Exemplo"
                  className="input-sm w-full"
                  errors={errors}
                  required
                  {...register("address.logradouro")}
                />

                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Input
                    label="Número"
                    type="text"
                    placeholder="123"
                    className="input-sm w-full"
                    errors={errors}
                    required
                    {...register("address.numero")}
                  />

                  <div className="col-span-2">
                    <Input
                      label="Complemento"
                      type="text"
                      placeholder="Apto 101"
                      className="input-sm w-full"
                      errors={errors}
                      {...register("address.complemento")}
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Imagem do Local (URL)"
                type="text"
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full"
                errors={errors}
                value={imageUrl}
                onChange={(e: any) => setImageUrl(String(e?.target?.value ?? ""))}
              />

              <Textarea
                label="Descrição e Necessidades"
                placeholder="Descreva a situação e o que é necessário..."
                className="textarea textarea-bordered h-24"
                errors={errors}
                required
                {...register("description")}
              />

              {process.env.API_KEY && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={generateSuggestions}
                    disabled={isGeneratingAI || !watch("description")}
                    className="text-primary font-medium flex items-center hover:underline disabled:opacity-50"
                  >
                    <IoMdBulb size={16} className="mr-1" />
                    {isGeneratingAI
                      ? "Gerando sugestões com IA..."
                      : "Sugerir produtos com IA"}
                  </button>
                </div>
              )}
            </div>

            {!isEditMode && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Produtos Solicitados</h3>
                  <button
                    type="button"
                    onClick={() =>
                      append({ name: "", requestedQuantity: 1, unit: UnitType.UN })
                    }
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    <IoMdAdd size={18} className="mr-1" /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-3 bg-base-200 p-4 rounded-lg">
                  {fields.length === 0 && (
                    <p className="text-base-content/50 text-center text-sm py-4">
                      Nenhum produto adicionado ainda.
                    </p>
                  )}

                  {(errors as any)?.requestedProducts?.message && (
                    <p className="text-error text-sm text-center">
                      {(errors as any)?.requestedProducts?.message as string}
                    </p>
                  )}

                  {fields.map((field, idx) => (
                    <div key={(field as any).id} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          placeholder="Nome"
                          className="input-sm w-full"
                          errors={errors}
                          {...register(`requestedProducts.${idx}.name` as const)}
                        />
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qtd"
                          className="input-sm w-full"
                          errors={errors}
                          {...register(
                            `requestedProducts.${idx}.requestedQuantity` as const,
                          )}
                        />
                      </div>

                      <div className="w-24">
                        <Select
                          className="select-sm w-full"
                          options={unitOptions}
                          errors={errors}
                          {...register(`requestedProducts.${idx}.unit` as const)}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="btn btn-square btn-sm btn-ghost text-error"
                      >
                        <IoMdTrash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card-actions">
              <button
                type="submit"
                disabled={
                  !watchedTitle ||
                  !watchedLogradouro ||
                  isSubmitting ||
                  (!isEditMode &&
                    (!watchedRequestedProducts || watchedRequestedProducts.length === 0))
                }
                className="btn btn-primary rounded-lg w-full text-white"
              >
                <IoMdSave size={20} className="mr-2" />
                {isEditMode ? "Salvar Alterações" : "Criar Ponto de Distribuição"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
