import axios from "../axios";

export async function refreshToken(token: string) {
  return await protectedRequest("POST", "/api/auth/refresh", token)
    .then((res) => res.data)
    .catch((err) => {
      console.log("Error refreshToken", err?.response?.data);
      return err.response;
    });
}

function protectedRequest(
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
