import { protectedRequest } from ".";
import axios from "../axios";

export async function refreshToken(token: string) {
    return await protectedRequest("POST", "/api/auth/refresh", token)
        .then((res) => res.data)
        .catch((err) => {
            console.log("Error refreshToken", err?.response?.data);
            return err.response;
        });
}
