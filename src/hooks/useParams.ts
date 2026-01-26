import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

function parseValue<T>(raw: string): T {
  const trimmed = raw.trim();

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
  if (!Number.isNaN(n) && trimmed !== "" && String(n) === trimmed) {
    return n as unknown as T;
  }

  return trimmed as unknown as T;
}

function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export default function useParams<T>(key: string, defaultValue: T) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultRef = useRef(defaultValue);

  const param = useMemo(() => {
    const raw = searchParams.get(key);
    if (raw === null || raw === "") return defaultRef.current;
    return parseValue<T>(raw);
  }, [searchParams, key]);

  const setParam = useCallback(
    (value: T | null | ((prev: T) => T)) => {
      const params = new URLSearchParams(searchParams);

      const newValue =
        typeof value === "function" ? (value as (p: T) => T)(param) : value;

      if (newValue === null || newValue === undefined) {
        params.delete(key);
      } else {
        const serialized = serializeValue(newValue);
        if (serialized === "") params.delete(key);
        else params.set(key, serialized);
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, key, param],
  );

  return [param, setParam] as const;
}
