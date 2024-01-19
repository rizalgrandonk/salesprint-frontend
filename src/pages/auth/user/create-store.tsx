import Alerts from "@/components/utils/Alerts";
import AppLogo from "@/components/utils/AppLogo";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import Meta from "@/components/utils/Meta";
import Redirect from "@/components/utils/Redirect";
import QueryKeys from "@/constants/queryKeys";
import useDebounce from "@/hooks/useDebounce";
import {
  createStore,
  getCities,
  getProvince,
  getStoreBySlug,
} from "@/lib/api/stores";
import { CreateStoreInputs, createStoreSchema } from "@/types/Store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function CreateStore() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [requestState, setRequestState] = useState({
    isLoading: false,
    error: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    setError,
  } = useForm<CreateStoreInputs>({
    resolver: zodResolver(createStoreSchema),
    mode: "all",
    defaultValues: {
      phone_number: session?.user?.phone_number || "",
    },
  });

  const {
    slug: currentSlug,
    province_id: currentProvinceId,
    city_id: currentCityId,
  } = watch();

  const { data: provinceList } = useQuery({
    queryKey: [QueryKeys.STORE_GET_PROVINCE],
    queryFn: () => getProvince(),
  });

  const { data: cityList, isLoading: loadingCities } = useQuery({
    queryKey: [QueryKeys.STORE_GET_CITES, currentProvinceId],
    queryFn: () => getCities(currentProvinceId),
    enabled: !!currentProvinceId,
  });

  const debouncedSlug = useDebounce(currentSlug, 2000);

  const checkSlug = useCallback(
    async (slugVal?: string) => {
      if (!slugVal) {
        return false;
      }

      const store = await getStoreBySlug(slugVal);

      if (store) {
        setError("slug", { message: "Domain toko sudah dipakai" });
        return false;
      }

      return true;
    },
    [setError]
  );

  useEffect(() => {
    checkSlug(debouncedSlug);
  }, [debouncedSlug, checkSlug]);

  useEffect(() => {
    if (!currentProvinceId) {
      return;
    }

    const province = provinceList?.find(
      (item) => item.province_id === currentProvinceId
    );
    if (!province) {
      return;
    }

    setValue("province", province.province);
  }, [currentProvinceId, setValue, provinceList]);

  useEffect(() => {
    if (!currentCityId) {
      return;
    }

    const city = cityList?.find((item) => item.city_id === currentCityId);
    if (!city) {
      return;
    }

    setValue("city", city.city_name);
    setValue("postal_code", city.postal_code);
  }, [currentCityId, setValue, cityList]);

  if (!session?.user || session?.user?.error) {
    return <Redirect to="/auth/login" />;
  }

  if (session.user?.role === "seller") {
    return <Redirect to="/seller/store" />;
  }

  const onSubmit: SubmitHandler<CreateStoreInputs> = async (data) => {
    setRequestState((prev) => ({ ...prev, isLoading: true }));
    const validSlug = await checkSlug(data.slug);
    if (!validSlug) {
      setRequestState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Domain toko tidak valid",
      }));
      return;
    }

    const result = await createStore(data, session.user.access_token);
    if (!result.success) {
      setRequestState({ isLoading: false, error: result.message });
      return;
    }

    const newSession = await updateSession();
    setRequestState((prev) => ({ ...prev, isLoading: false }));
    router.push("/seller/store");
  };

  const host = window.location.host;

  const provinceOptions = (provinceList || []).map((item) => ({
    title: item.province,
    value: item.province_id,
  }));
  const cityOptions = (cityList || []).map((item) => ({
    title: item.city_name,
    value: item.city_id,
  }));

  return (
    <>
      <Meta title="Salesprint | Buka Toko" />

      <div className="flex items-center w-full h-full max-w-xl py-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 relative">
        <div className="w-full max-h-full overflow-y-auto px-16">
          <div className="flex flex-col gap-4 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 text-primary">
                <AppLogo />
              </div>
              <h2 className="text-3xl font-semibold text-cente">Salesprint</h2>
            </Link>

            <p className="text-lg text-gray-500 dark:text-gray-300">
              Buka toko anda sekarang
            </p>
          </div>

          {!!requestState.error && (
            <Alerts variant="danger">Error: {requestState.error}</Alerts>
          )}

          <div className="mt-8">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormInput
                {...register("phone_number")}
                type="text"
                id="phone_number"
                label="Nomor telepon"
                placeholder="Masukan nomor telepon anda"
                error={errors.phone_number?.message}
                disabled
              />
              <FormInput
                {...register("name")}
                type="text"
                id="name"
                label="Nama toko"
                placeholder="Masukan nama toko anda"
                error={errors.name?.message}
              />
              <FormInput
                {...register("slug")}
                type="text"
                id="slug"
                label={`Domain toko`}
                placeholder="Masukan domain toko anda"
                info={
                  <div className="text-gray-500 text-sm flex items-center py-1">
                    <span>{`cth: ${host}/`}</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">
                      {`domain-toko`}
                    </span>
                  </div>
                }
                error={errors.slug?.message}
              />
              <FormSelect
                {...register("province_id")}
                id="province_id"
                label="Provonsi"
                placeholder="Pilih provinsi"
                error={errors.province_id?.message || errors.province?.message}
                options={provinceOptions}
              />
              <FormSelect
                {...register("city_id")}
                id="city_id"
                label="Kota"
                disabled={loadingCities}
                placeholder={loadingCities ? "Loading..." : "Pilih kota"}
                error={errors.city_id?.message || errors.city?.message}
                options={cityOptions}
              />
              <FormInput
                {...register("address")}
                type="text"
                id="address"
                label="Alamat toko"
                placeholder="Masukan alamat toko anda"
                error={errors.address?.message}
              />
              <FormInput
                {...register("postal_code")}
                type="text"
                id="postal_code"
                label="Kode pos toko"
                placeholder="Masukan kode pos toko anda"
                error={errors.postal_code?.message}
              />

              <div className="py-4 flex items-center justify-end gap-4">
                <Button
                  variant="primary"
                  outline
                  onClick={async () => {
                    const newSession = await updateSession();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={requestState.isLoading}
                  isLoading={requestState.isLoading}
                >
                  Selesai
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
