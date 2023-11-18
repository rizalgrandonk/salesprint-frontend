import { AxiosRequestConfig } from "axios";
import axios from "../axios";

type RequestConfig = {
  method?: string;
  path: string;
  data?: any;
  params?: any;
};

export type RequestError = {
  errors?: { [key: string]: string[] }[];
  message: string;
};

export function protectedRequest<T = any>(
  { method, path, token, data, params }: RequestConfig & { token: string },
  config?: AxiosRequestConfig
) {
  return axios<T>(path, {
    method: method || "GET",
    data: data,
    params: params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...config,
  });
}

export function publicRequest<T = any>(
  { method, path, data, params }: RequestConfig,
  config?: AxiosRequestConfig
) {
  return axios<T>(path, {
    method: method || "GET",
    data: data,
    params: params,
    ...config,
  });
}
