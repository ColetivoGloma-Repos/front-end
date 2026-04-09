import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoMdPin, IoMdAdd, IoMdTrash, IoMdSave } from "react-icons/io";
import {
  Button,
  Input,
  Select,
  Textarea,
  ImageUpload,
} from "../../../components/common";
import { UnitType } from "../../../interfaces/products";
import { toast } from "react-toastify";
import {
  ICreateDistributionPoint,
  IDistributionPoint,
} from "../../../interfaces/distribution-point";
import {
  createDistributionPoint,
  listOneDistributionPoint,
  updateDistributionPoint,
} from "../../../services/distribution-point";
import { uploadImage } from "../../../services/upload.service";
import { ActionButton } from "./ActionButton";
import { ReturnButton } from "./ReturnButton";
import { upsertDistributionPointSchema } from "../validations";
import { getNestedValue } from "../../../utils";
import { integerMask, phoneMask, zipCodeMask } from "../../../utils/masks";

interface IDistributionPointFormProps {
  isEditMode: boolean;
  data?: IDistributionPoint;
  navigationCallback?: () => void;
  saveOrEditCallback?: (data: IDistributionPoint, distributionPointId?: string) => void;
}

export function DistributionPointForm({
  data,
  isEditMode = false,
  saveOrEditCallback,
  navigationCallback,
}: IDistributionPointFormProps) {
  const [requesting, setRequesting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const latestUploadedFile = React.useMemo(
    () =>
      data?.files && data.files.length > 0
        ? [...data.files].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0]
        : null,
    [data?.files],
  );

  const schema = React.useMemo(
    () => upsertDistributionPointSchema(isEditMode),
    [isEditMode],
  );

  const defaultValues: ICreateDistributionPoint = React.useMemo(
    () => ({
      title: data?.title || "",
      description: data?.description || "",
      phone: phoneMask(data?.phone || ""),
      address: {
        cep: zipCodeMask(data?.address.cep || ""),
        pais: data?.address.pais || "Brasil",
        estado: data?.address.estado || "",
        municipio: data?.address.municipio || "",
        bairro: data?.address.bairro || "",
        logradouro: data?.address.logradouro || "",
        numero: integerMask(data?.address.numero || ""),
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

  const handleCreatePoint = async (values: ICreateDistributionPoint) => {
    setRequesting(true);

    try {
      const response = await createDistributionPoint(values);
      let distributionPointResponse = response;

      if (selectedFile) {
        await uploadImage(selectedFile, "distributionPoint", response.id);
        distributionPointResponse = await listOneDistributionPoint(response.id);
      }

      if (saveOrEditCallback) {
        await Promise.resolve(saveOrEditCallback(distributionPointResponse));
      }
      toast.success("Ponto de distribuição criado com sucesso!");
      navigationCallback?.();
    } catch (e) {
      const error = e as Error & { statusCode: number };
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao criar ponto de distribuição. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleSaveEdit = async (values: ICreateDistributionPoint) => {
    if (!data?.id) return;
    const id = data.id;

    setRequesting(true);

    try {
      const response = await updateDistributionPoint(id, values);
      let distributionPointResponse = response;

      if (selectedFile) {
        await uploadImage(selectedFile, "distributionPoint", id);
        distributionPointResponse = await listOneDistributionPoint(id);
      }

      if (saveOrEditCallback) {
        await Promise.resolve(saveOrEditCallback(distributionPointResponse, id));
      }
      toast.success("Alterações salvas com sucesso!");
      navigationCallback?.();
    } catch (e) {
      const error = e as Error & { statusCode: number };
      console.error(error);

      toast.error(
        error.message || "Erro ao salvar alterações. Tente novamente mais tarde.",
      );
    } finally {
      setRequesting(false);
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
      <ReturnButton onClick={navigationCallback} className="mb-6" />

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
                  mask={phoneMask}
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
                    className="input-sm w-full bg-white"
                    errors={errors}
                    mask={zipCodeMask}
                    {...register("address.cep")}
                  />

                  <Input
                    label="País"
                    type="text"
                    className="input-sm w-full bg-white"
                    errors={errors}
                    required
                    {...register("address.pais")}
                  />

                  <Input
                    label="Estado (UF)"
                    type="text"
                    placeholder="BA"
                    className="input-sm w-full bg-white"
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
                    className="input-sm w-full bg-white"
                    errors={errors}
                    required
                    {...register("address.municipio")}
                  />

                  <Input
                    label="Bairro"
                    type="text"
                    placeholder="Centro"
                    className="input-sm w-full bg-white"
                    errors={errors}
                    required
                    {...register("address.bairro")}
                  />
                </div>

                <Input
                  label="Logradouro"
                  type="text"
                  placeholder="Rua Exemplo"
                  className="input-sm w-full bg-white"
                  errors={errors}
                  required
                  {...register("address.logradouro")}
                />

                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Input
                    label="Número"
                    type="text"
                    placeholder="123"
                    className="input-sm w-full bg-white"
                    errors={errors}
                    required
                    mask={integerMask}
                    {...register("address.numero")}
                  />

                  <div className="col-span-2">
                    <Input
                      label="Complemento"
                      type="text"
                      placeholder="Apto 101"
                      className="input-sm w-full bg-white"
                      errors={errors}
                      {...register("address.complemento")}
                    />
                  </div>
                </div>
              </div>

              <ImageUpload
                label="Imagem do Local"
                value={selectedFile || latestUploadedFile?.url}
                onChange={(file) => setSelectedFile(file)}
              />

              <Textarea
                label="Descrição e Necessidades"
                placeholder="Descreva a situação e o que é necessário..."
                className="textarea textarea-bordered h-24"
                errors={errors}
                required
                {...register("description")}
              />
            </div>

            {!isEditMode && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Produtos Solicitados</h3>
                  <Button
                    type="button"
                    className="btn btn-sm btn-outline btn-primary hover:!bg-blue-800 h-8 !rounded-md !text-white"
                    onClick={() =>
                      append({ name: "", requestedQuantity: 1, unit: UnitType.UN })
                    }
                    text={
                      <>
                        <IoMdAdd size={18} className="mr-1" /> Adicionar Item
                      </>
                    }
                  />
                </div>

                <div className="space-y-3 bg-base-200 p-4 rounded-lg">
                  {fields.length === 0 && (
                    <p className="text-base-content/50 text-center text-sm py-4">
                      Nenhum produto adicionado ainda.
                    </p>
                  )}

                  {errors?.requestedProducts?.message && (
                    <p className="text-error text-sm text-center">
                      {errors?.requestedProducts?.message as string}
                    </p>
                  )}

                  {fields.map((field, idx) => {
                    const nameError =
                      (errors &&
                        getNestedValue(errors, `requestedProducts.${idx}.name`)
                          ?.message) ||
                      "";

                    const qtyError =
                      (errors &&
                        getNestedValue(
                          errors,
                          `requestedProducts.${idx}.requestedQuantity`,
                        )?.message) ||
                      "";

                    const unitError =
                      (errors &&
                        getNestedValue(errors, `requestedProducts.${idx}.unit`)
                          ?.message) ||
                      "";

                    const rowError = (nameError || qtyError || unitError) as string;

                    return (
                      <div key={field.id} className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <Input
                              placeholder="Nome"
                              className={`input-sm w-full h-9 bg-white ${nameError && "input-error"}`}
                              {...register(`requestedProducts.${idx}.name` as const)}
                            />
                          </div>

                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="Qtd"
                              className={`input-sm w-full h-9 bg-white ${qtyError && "input-error"}`}
                              {...register(
                                `requestedProducts.${idx}.requestedQuantity` as const,
                              )}
                            />
                          </div>

                          <div className="w-24">
                            <Select
                              className={`select-sm w-full h-9 bg-white ${unitError && "input-error"}`}
                              options={unitOptions}
                              {...register(`requestedProducts.${idx}.unit` as const)}
                            />
                          </div>

                          <ActionButton
                            styleType="red"
                            className="rounded-lg size-9"
                            onClick={() => remove(idx)}
                            icon={<IoMdTrash size={18} />}
                          />
                        </div>

                        {rowError && (
                          <p className="text-error text-sm text-center">{rowError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card-actions">
              <Button
                type="submit"
                disabled={
                  !watchedTitle ||
                  !watchedLogradouro ||
                  isSubmitting ||
                  requesting ||
                  (!isEditMode &&
                    (!watchedRequestedProducts || watchedRequestedProducts.length === 0))
                }
                className="btn-primary w-full text-white !rounded-lg"
                prefix={
                  requesting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <IoMdSave size={20} />
                  )
                }
                text={isEditMode ? "Salvar Alterações" : "Criar Ponto de Distribuição"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
