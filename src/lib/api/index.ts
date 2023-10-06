import axios from "../axios";

type RequestConfig = {
  method?: string;
  path: string;
  data?: any;
};

export function protectedRequest<T = any>({
  method,
  path,
  token,
  data,
}: RequestConfig & { token: string }) {
  return axios<T>(path, {
    method: method || "GET",
    data: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function publicRequest<T = any>({ method, path, data }: RequestConfig) {
  return axios<T>(path, {
    method: method || "GET",
    data: data,
  });
}
