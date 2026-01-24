import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  IoMdArrowBack,
  IoMdCall,
  IoMdPin,
  IoMdImage,
  IoMdBulb,
  IoMdAdd,
  IoMdTrash,
  IoMdSave,
} from "react-icons/io";
import { Input, Select, Textarea } from "../../../components/common";
import { UnitType } from "../../../interfaces/products";

interface IDistributionPointFormProps {
  isEditMode: boolean;
}

type DistributionPointFormValues = {
  name: string;
  phone: string;
  imageUrl: string;
  description: string;
  address: {
    cep: string;
    pais: string;
    estado: string;
    municipio: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento: string;
  };
  products: Array<{
    name: string;
    targetAmount: number;
    unit: UnitType;
  }>;
};

function buildSchema(isEditMode: boolean) {
  const base = z.object({
    name: z.string().trim().min(1, "Nome do ponto é obrigatório"),
    phone: z.string().trim().min(1, "Telefone é obrigatório"),
    imageUrl: z
      .string()
      .trim()
      .optional()
      .transform((v) => v ?? "")
      .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), "URL inválida"),
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
    products: z.array(
      z.object({
        name: z.string().trim().min(1, "Nome do produto é obrigatório"),
        targetAmount: z.coerce
          .number({
            invalid_type_error: "Qtd deve ser um número",
            required_error: "Qtd é obrigatória",
          })
          .positive("Qtd deve ser maior que zero"),
        unit: z.nativeEnum(UnitType),
      }),
    ),
  });

  if (isEditMode) {
    return base.extend({
      products: base.shape.products.optional().transform((v) => v ?? []),
    });
  }

  return base.superRefine((val, ctx) => {
    if (!val.products || val.products.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["products"],
        message: "Adicione pelo menos 1 produto",
      });
    }
  });
}

export function DistributionPointForm({
  isEditMode = false,
}: IDistributionPointFormProps) {
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);

  const setIsEditingPoint = (value: boolean) => {
    void value;
  };

  const setIsCreating = (value: boolean) => {
    void value;
  };

  const schema = React.useMemo(() => buildSchema(isEditMode), [isEditMode]);

  const defaultValues: DistributionPointFormValues = React.useMemo(
    () => ({
      name: "",
      phone: "",
      imageUrl: "",
      description: "",
      address: {
        cep: "",
        pais: "Brasil",
        estado: "",
        municipio: "",
        bairro: "",
        logradouro: "",
        numero: "",
        complemento: "",
      },
      products: [],
    }),
    [],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<DistributionPointFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const unitOptions = React.useMemo(
    () =>
      Object.values(UnitType).map((u) => ({
        label: u,
        value: u,
      })),
    [],
  );

  const watchedName = watch("name");
  const watchedLogradouro = watch("address.logradouro");
  const watchedProducts = watch("products");

  const generateSuggestions = async () => {
    const description = getValues("description");
    if (!description) return;

    setIsGeneratingAI(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      append({ name: "Água mineral", targetAmount: 20, unit: UnitType.UN });
      append({ name: "Cesta básica", targetAmount: 10, unit: UnitType.UN });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreatePoint = async (values: DistributionPointFormValues) => {
    void values;
  };

  const handleSaveEdit = async (values: DistributionPointFormValues) => {
    void values;
  };

  const onSubmit = async (values: DistributionPointFormValues) => {
    if (isEditMode) {
      await handleSaveEdit(values);
      return;
    }
    await handleCreatePoint(values);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => (isEditMode ? setIsEditingPoint(false) : setIsCreating(false))}
        className="btn btn-ghost btn-sm mb-6"
        type="button"
      >
        <IoMdArrowBack size={20} className="mr-2" /> Voltar
      </button>

      <div className="card bg-base-100 shadow-xl">
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
                  errors={errors as any}
                  required
                  {...register("name")}
                />

                <Input
                  label={
                    (
                      <span className="flex items-center gap-2">
                        <IoMdCall size={14} /> Telefone de Contato
                      </span>
                    ) as any
                  }
                  type="text"
                  placeholder="(00) 00000-0000"
                  className="w-full"
                  errors={errors as any}
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
                    errors={errors as any}
                    {...register("address.cep")}
                  />

                  <Input
                    label="País"
                    type="text"
                    className="input-sm w-full"
                    errors={errors as any}
                    required
                    {...register("address.pais")}
                  />

                  <Input
                    label="Estado (UF)"
                    type="text"
                    placeholder="BA"
                    className="input-sm w-full"
                    errors={errors as any}
                    required
                    maxLength={2}
                    {...register("address.estado", {
                      onChange: (e) =>
                        setValue(
                          "address.estado",
                          String(e.target.value || "").toUpperCase(),
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
                    errors={errors as any}
                    required
                    {...register("address.municipio")}
                  />

                  <Input
                    label="Bairro"
                    type="text"
                    placeholder="Centro"
                    className="input-sm w-full"
                    errors={errors as any}
                    required
                    {...register("address.bairro")}
                  />
                </div>

                <Input
                  label="Logradouro"
                  type="text"
                  placeholder="Rua Exemplo"
                  className="input-sm w-full"
                  errors={errors as any}
                  required
                  {...register("address.logradouro")}
                />

                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Input
                    label="Número"
                    type="text"
                    placeholder="123"
                    className="input-sm w-full"
                    errors={errors as any}
                    required
                    {...register("address.numero")}
                  />

                  <div className="col-span-2">
                    <Input
                      label="Complemento"
                      type="text"
                      placeholder="Apto 101"
                      className="input-sm w-full"
                      errors={errors as any}
                      {...register("address.complemento")}
                    />
                  </div>
                </div>
              </div>

              <Input
                label={
                  (
                    <span className="flex items-center gap-2">
                      <IoMdImage size={16} /> Imagem do Local (URL)
                    </span>
                  ) as any
                }
                type="text"
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full"
                errors={errors as any}
                {...register("imageUrl")}
              />

              <Textarea
                label="Descrição e Necessidades"
                placeholder="Descreva a situação e o que é necessário..."
                className="textarea textarea-bordered h-24"
                errors={errors as any}
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
                      append({ name: "", targetAmount: 1, unit: UnitType.UNIT })
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

                  {(errors as any)?.products?.message && (
                    <p className="text-error text-sm text-center">
                      {(errors as any)?.products?.message as string}
                    </p>
                  )}

                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          placeholder="Nome"
                          className="input-sm w-full"
                          errors={errors as any}
                          {...register(`products.${idx}.name` as const)}
                        />
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qtd"
                          className="input-sm w-full"
                          errors={errors as any}
                          {...register(`products.${idx}.targetAmount` as const)}
                        />
                      </div>

                      <div className="w-24">
                        <Select
                          className="select-sm w-full"
                          options={unitOptions}
                          errors={errors as any}
                          {...register(`products.${idx}.unit` as const)}
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
                  !watchedName ||
                  !watchedLogradouro ||
                  isSubmitting ||
                  (!isEditMode && (!watchedProducts || watchedProducts.length === 0))
                }
                className="btn btn-primary w-full text-white"
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
