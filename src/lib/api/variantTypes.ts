import { VariantType } from "@/types/Variant";
import { protectedRequest } from ".";

type VariantTypeForm = { name: string };

export async function createVariantType(data: VariantTypeForm, token: string) {
  return await protectedRequest<VariantType>({
    method: "POST",
    path: `/variant-types`,
    token,
    data,
  });
}

export async function updateVariantType(
  id: string,
  data: VariantTypeForm,
  token: string
) {
  return await protectedRequest<VariantType>({
    method: "POST",
    path: `/variant-types/${id}`,
    token,
    data,
  });
}

export async function deleteVariantType(id: string, token: string) {
  return await protectedRequest<VariantType>({
    method: "DELETE",
    path: `/variant-types/${id}`,
    token,
  });
}
