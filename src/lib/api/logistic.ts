import { City, Province } from "@/types/Store";
import { publicRequest } from ".";

export async function getProvince() {
  const result = await publicRequest<Province[]>({
    method: "GET",
    path: `/logistic/province`,
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getCities(provinceId?: string) {
  if (!provinceId) {
    return null;
  }

  const result = await publicRequest<City[]>({
    method: "GET",
    path: `/logistic/city`,
    params: { province_id: provinceId },
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}
