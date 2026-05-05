import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoMdPin, IoMdAdd, IoMdTrash, IoMdSave, IoMdHome } from "react-icons/io";
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
import { listShelters, createShelter } from "../../../services/shelter.service";
import { IShelter } from "../../../interfaces/shelter";
import { ICreateAddress } from "../../../interfaces/address";
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
  const [shelters, setShelters] = React.useState<IShelter[]>([]);
  const [shelterMode, setShelterMode] = React.useState<"none" | "existing" | "new">(
    data?.shelterId ? "existing" : "none",
  );
  type NewShelterForm = { name: string; phone: string; description: string; address: ICreateAddress };
  const [newShelterFields, setNewShelterFields] = React.useState<NewShelterForm>({
    name: "",
    phone: "",
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
  });
  const [newShelterErrors, setNewShelterErrors] = React.useState<Record<string, string>>({});
  const [shelterCepLoading, setShelterCepLoading] = React.useState(false);
  const [shelterCepError, setShelterCepError] = React.useState("");

  React.useEffect(() => {
    listShelters({})
      .then((res: any) => {
        const list = res?.data ?? res?.items ?? [];
        setShelters(Array.isArray(list) ? list : []);
        if (data?.shelterId) {
          setValue("shelterId", data.shelterId);
        }
      })
      .catch(() => setShelters([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateShelterField = (field: string, value: string) => {
    setNewShelterFields((prev) => {
      if (field.startsWith("address.")) {
        const key = field.replace("address.", "");
        return { ...prev, address: { ...prev.address, [key]: value } };
      }
      return { ...prev, [field]: value };
    });
    setNewShelterErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleShelterCepChange = async (raw: string) => {
    const masked = zipCodeMask(raw);
    updateShelterField("address.cep", masked);
    setShelterCepError("");

    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setShelterCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setShelterCepError("CEP não encontrado.");
        return;
      }

      setNewShelterFields((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          cep: masked,
          logradouro: data.logradouro || prev.address.logradouro,
          bairro: data.bairro || prev.address.bairro,
          municipio: data.localidade || prev.address.municipio,
          estado: data.uf || prev.address.estado,
          pais: "Brasil",
        },
      }));
    } catch {
      setShelterCepError("Erro ao buscar CEP.");
    } finally {
      setShelterCepLoading(false);
    }
  };

  const validateNewShelter = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!newShelterFields.name.trim()) errors.name = "Nome é obrigatório";
    if (!newShelterFields.phone.trim()) errors.phone = "Telefone é obrigatório";
    if (!newShelterFields.address.pais.trim()) errors["address.pais"] = "País é obrigatório";
    if (!newShelterFields.address.estado.trim()) errors["address.estado"] = "Estado é obrigatório";
    if (!newShelterFields.address.municipio.trim()) errors["address.municipio"] = "Município é obrigatório";
    if (!newShelterFields.address.bairro.trim()) errors["address.bairro"] = "Bairro é obrigatório";
    if (!newShelterFields.address.logradouro.trim()) errors["address.logradouro"] = "Logradouro é obrigatório";
    if (!newShelterFields.address.numero.trim()) errors["address.numero"] = "Número é obrigatório";
    return errors;
  };

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
      shelterId: data?.shelterId ?? null,
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
  const watchedShelterId = watch("shelterId");

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
    let resolvedShelterId: string | null = null;

    if (shelterMode === "existing") {
      resolvedShelterId = values.shelterId ?? null;
    } else if (shelterMode === "new") {
      const errors = validateNewShelter();
      if (Object.keys(errors).length > 0) {
        setNewShelterErrors(errors);
        return;
      }
      setRequesting(true);
      try {
        const created = (await createShelter(newShelterFields as any)) as IShelter;
        resolvedShelterId = created.id;
        setShelters((prev) => [...prev, created]);
      } catch (e) {
        const error = e as Error;
        toast.error(error.message || "Erro ao criar abrigo. Tente novamente.");
        setRequesting(false);
        return;
      }
      setRequesting(false);
    }

    const finalValues = { ...values, shelterId: resolvedShelterId };

    if (isEditMode) {
      await handleSaveEdit(finalValues);
      return;
    }
    await handleCreatePoint(finalValues);
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

              <div className="bg-base-200 p-4 rounded-lg space-y-4">
                <label className="label pt-0 pb-0">
                  <span className="label-text font-bold text-lg flex items-center gap-2">
                    <IoMdHome size={16} /> Abrigo
                  </span>
                </label>

                <div className="flex gap-2">
                  {(["none", "existing", "new"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setShelterMode(mode)}
                      className={`btn btn-sm rounded-lg flex-1 ${
                        shelterMode === mode
                          ? "btn-primary text-white"
                          : "btn-outline"
                      }`}
                    >
                      {mode === "none"
                        ? "Nenhum"
                        : mode === "existing"
                          ? "Selecionar existente"
                          : "Criar novo"}
                    </button>
                  ))}
                </div>

                {shelterMode === "existing" && (
                  <Select
                    className="w-full"
                    value={watchedShelterId ?? ""}
                    options={[
                      { label: "Selecione um abrigo...", value: "" },
                      ...(Array.isArray(shelters) ? shelters : []).map((s) => ({
                        label: s.name,
                        value: s.id,
                      })),
                    ]}
                    {...register("shelterId")}
                  />
                )}

                {shelterMode === "new" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold">
                          Nome <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Nome do abrigo"
                          className={`input input-bordered rounded-xl h-10 w-full ${newShelterErrors.name ? "input-error" : ""}`}
                          value={newShelterFields.name}
                          onChange={(e) => updateShelterField("name", e.target.value)}
                        />
                        {newShelterErrors.name && (
                          <p className="text-error text-sm">{newShelterErrors.name}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">
                          Telefone <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="(00) 00000-0000"
                          className={`input input-bordered rounded-xl h-10 w-full ${newShelterErrors.phone ? "input-error" : ""}`}
                          value={newShelterFields.phone}
                          onChange={(e) =>
                            updateShelterField("phone", phoneMask(e.target.value))
                          }
                        />
                        {newShelterErrors.phone && (
                          <p className="text-error text-sm">{newShelterErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Descrição</label>
                      <textarea
                        placeholder="Descrição do abrigo"
                        className="textarea textarea-bordered rounded-xl h-20 w-full"
                        value={newShelterFields.description}
                        onChange={(e) =>
                          updateShelterField("description", e.target.value)
                        }
                      />
                    </div>

                    <label className="label pt-1 pb-0">
                      <span className="label-text font-bold flex items-center gap-2">
                        <IoMdPin size={14} /> Endereço do Abrigo
                      </span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="CEP"
                            maxLength={9}
                            className={`input input-bordered input-sm rounded-xl bg-white w-full ${shelterCepError ? "input-error" : ""}`}
                            value={newShelterFields.address.cep}
                            onChange={(e) => handleShelterCepChange(e.target.value)}
                          />
                          {shelterCepLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs" />
                          )}
                        </div>
                        {shelterCepError && (
                          <p className="text-error text-xs">{shelterCepError}</p>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="País"
                        className={`input input-bordered input-sm rounded-xl bg-white w-full ${newShelterErrors["address.pais"] ? "input-error" : ""}`}
                        value={newShelterFields.address.pais}
                        onChange={(e) =>
                          updateShelterField("address.pais", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="UF *"
                        maxLength={2}
                        className={`input input-bordered input-sm rounded-xl bg-white w-full ${newShelterErrors["address.estado"] ? "input-error" : ""}`}
                        value={newShelterFields.address.estado}
                        onChange={(e) =>
                          updateShelterField(
                            "address.estado",
                            e.target.value.toUpperCase(),
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Município *"
                        className={`input input-bordered input-sm rounded-xl bg-white w-full ${newShelterErrors["address.municipio"] ? "input-error" : ""}`}
                        value={newShelterFields.address.municipio}
                        onChange={(e) =>
                          updateShelterField("address.municipio", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Bairro *"
                        className={`input input-bordered input-sm rounded-xl bg-white w-full ${newShelterErrors["address.bairro"] ? "input-error" : ""}`}
                        value={newShelterFields.address.bairro}
                        onChange={(e) =>
                          updateShelterField("address.bairro", e.target.value)
                        }
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Logradouro *"
                      className={`input input-bordered input-sm rounded-xl bg-white w-full ${newShelterErrors["address.logradouro"] ? "input-error" : ""}`}
                      value={newShelterFields.address.logradouro}
                      onChange={(e) =>
                        updateShelterField("address.logradouro", e.target.value)
                      }
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Número *"
                        className={`input input-bordered input-sm rounded-xl bg-white w-full ${newShelterErrors["address.numero"] ? "input-error" : ""}`}
                        value={newShelterFields.address.numero}
                        onChange={(e) =>
                          updateShelterField(
                            "address.numero",
                            integerMask(e.target.value),
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Complemento"
                        className="input input-bordered input-sm rounded-xl bg-white w-full col-span-2"
                        value={newShelterFields.address.complemento}
                        onChange={(e) =>
                          updateShelterField("address.complemento", e.target.value)
                        }
                      />
                    </div>

                    {Object.keys(newShelterErrors).length > 0 && (
                      <p className="text-error text-sm text-center">
                        Preencha os campos obrigatórios do abrigo.
                      </p>
                    )}
                  </div>
                )}
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
