import { useSearchParams } from "react-router-dom";

export default function useParams<T extends string>(key: string, defaultValue?: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const param = (searchParams.get(key) as T | undefined) || defaultValue || undefined;

  const setParam = (value: T | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return [param, setParam] as const;
}
