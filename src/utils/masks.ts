export const zipCodeMask = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.slice(0, 8);
  value = value.replace(/(\d{5})(\d)/, "$1-$2");
  return value;
};

export const phoneMask = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.slice(0, 11);
  value = value.replace(/(\d{2})(\d)/, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value;
};

export const percentageMask = (value: string) => {
  if (!value) return "";
  value = value.replace(",", ".");
  value = value.replace(/[^0-9.]/g, "");
  const parts = value.split(".");
  if (parts.length > 2) {
    value = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  if (value.startsWith(".")) {
    value = `0${value}`;
  }
  return value;
};
