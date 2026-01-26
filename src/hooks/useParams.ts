import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

function parseValue<T>(raw: string): T {
  const trimmed = raw.trim();

  // Se parece com objeto ou array, tenta JSON.parse
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return trimmed as unknown as T;
    }
  }

  if (trimmed === "true") return true as unknown as T;
  if (trimmed === "false") return false as unknown as T;

  const n = Number(trimmed);
  // Verifica se é um número válido e não uma string numérica com zeros à esquerda (ex: "01")
  if (!Number.isNaN(n) && trimmed !== "" && String(n) === trimmed) {
    return n as unknown as T;
  }

  return trimmed as unknown as T;
}

function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value; // Removido encodeURIComponent
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value); // Removido encodeURIComponent
}

export default function useParams<T>(key: string, defaultValue: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const param = useMemo(() => {
    const raw = searchParams.get(key);
    if (raw === null || raw === "") return defaultValue;
    return parseValue<T>(raw);
  }, [searchParams, key, defaultValue]);

  const setParam = useCallback(
    (value: T | null | ((prev: T) => T)) => {
      const params = new URLSearchParams(searchParams);

      // Suporte a functional update (igual ao useState)
      const newValue = typeof value === "function" ? (value as Function)(param) : value;

      if (newValue === null || newValue === undefined) {
        params.delete(key);
      } else {
        const serialized = serializeValue(newValue);
        params.set(key, serialized);
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, key, param],
  );

  return [param, setParam] as const;
}
