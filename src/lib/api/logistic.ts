import { City, District, Province } from "@/types/Store";
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

export async function getDistricts(cityId?: string) {
  if (!cityId) {
    return null;
  }

  const result = await publicRequest<District[]>({
    method: "GET",
    path: `/logistic/district`,
    params: { city_id: cityId },
  });

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getCosts(data: {origin: string, destination: string, weight: number}) {
  const result = await publicRequest<{
    code: string,
    name: string,
    costs: {
      service: string,
      cost : {value: number, etd: string}[]
    }[]
  }[]>({
    method: "POST",
    path: `/logistic/cost`,
    data: data
  });

  if (!result.success) {
    return null;
  }

  return result.data[0] ?? null;
}
