import axios from "../axios";

export function protectedRequest(
  method: string = "GET",
  url: string,
  token: string,
  data?: any
) {
  return axios(url, {
    method: method,
    data: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function publicRequest<T = any>(
  method: string = "GET",
  url: string,
  data?: any
) {
  return axios<T>(url, {
    method: method,
    data: data,
  });
}
