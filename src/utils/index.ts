import moment from "moment";
import "moment/locale/pt-br";
import { IAddress } from "../interfaces/address";

moment.locale("pt-br");

export function getNestedValue(obj: { [key: string]: any }, path: string) {
  const keys = path.split(".");
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }

  return value;
}

export const formatDate = (
  date: string | Date,
  format: string = "DD/MM/YYYY HH:mm:ss",
): string => {
  const parsedDate = moment(date);
  if (!parsedDate.isValid()) {
    return "Data inválida";
  }

  return parsedDate.format(format);
};

export function formatAddress(address: IAddress): string {
  const logradouroNumero = [address.logradouro?.trim(), address.numero?.trim()]
    .filter(Boolean)
    .join(", ");

  const complemento = address.complemento?.trim();
  const bairro = address.bairro?.trim();
  const municipio = address.municipio?.trim();
  const estado = address.estado?.trim();

  const bairroParte = bairro ? ` - ${bairro}` : "";
  const complementoParte = complemento ? `, ${complemento}` : "";
  const cidadeUfParte =
    municipio || estado
      ? `${municipio ?? ""}${municipio && estado ? "/" : ""}${estado ?? ""}`
      : "";

  return `${logradouroNumero}${complementoParte}${bairroParte}${cidadeUfParte ? `, ${cidadeUfParte}` : ""}`.trim();
}
