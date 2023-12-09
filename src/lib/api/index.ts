import {
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
  isAxiosError,
} from "axios";
import axios from "../axios";

type RequestConfig = {
  method?: string;
  path: string;
  data?: any;
  params?: any;
  headers?: RawAxiosRequestHeaders;
};

export type RequestError = {
  success: false;
  errors?: { [key: string]: string[] };
  message: string;
};

export type RequestSuccess<T = any> = {
  success: true;
  data: T;
  message?: string;
};

export async function protectedRequest<T = any>(
  {
    method,
    path,
    token,
    data,
    params,
    headers,
  }: RequestConfig & { token: string },
  config?: AxiosRequestConfig
): Promise<RequestSuccess<T> | RequestError> {
  try {
    const response = await axios<RequestSuccess<T>>(path, {
      method: method || "GET",
      data: data,
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      ...config,
    });

    return response.data;
  } catch (err) {
    console.log("Request Error");

    if (!isAxiosError(err)) {
      return {
        success: false,
        message: "Service Error",
      };
    }

    console.log(err.message);

    if (!err.response) {
      return {
        success: false,
        message: err.message,
      };
    }

    console.log(err.response);
    return err.response.data as RequestError;
  }
}

export async function publicRequest<T = any>(
  { method, path, data, params, headers }: RequestConfig,
  config?: AxiosRequestConfig
): Promise<RequestSuccess<T> | RequestError> {
  try {
    const response = await axios<RequestSuccess<T>>(path, {
      method: method || "GET",
      data: data,
      params: params,
      headers: headers,
      ...config,
    });

    return response.data;
  } catch (err) {
    console.log(err);

    if (!isAxiosError(err)) {
      return {
        success: false,
        message: "Service Error",
      };
    }

    console.log(err.message);

    if (!err.response) {
      return {
        success: false,
        message: err.message,
      };
    }

    console.log(err.response);
    return err.response.data as RequestError;
  }
}
