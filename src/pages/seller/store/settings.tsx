import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button } from "@/components/utils/Button";
import FormArea from "@/components/utils/FormArea";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import QueryKeys from "@/constants/queryKeys";
import {
  getCities,
  getProvince,
  getUserStore,
  updateStore,
} from "@/lib/api/stores";
import {
  EditStoreInputs,
  Store,
  StoreBanner,
  editStoreSchema,
} from "@/types/Store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toFormData } from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import {
  MdAddToPhotos,
  MdDeleteOutline,
  MdModeEdit,
  MdSave,
  MdUpload,
} from "react-icons/md";
import Carousel from "react-multi-carousel";

const MAX_BANNERS = 3;

export default function StoreSettings() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const [requestState, setRequestState] = useState({
    isLoading: false,
    error: "",
    success: false,
  });

  const {
    created_at,
    updated_at,
    store_banners,
    store_categories,
    image,
    slug,
    ...storeInfoData
  } = store || {};

  const formData = useForm<EditStoreInputs>({
    resolver: zodResolver(editStoreSchema),
    mode: "all",
    defaultValues: {
      ...storeInfoData,
    },
  });

  const {
    handleSubmit: formInfoSubmit,
    formState: { isDirty: isFormInfoDirty },
    reset,
  } = formData;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (isFormInfoDirty) {
      return;
    }
    if (store) {
      const {
        created_at,
        updated_at,
        store_banners,
        store_categories,
        image,
        slug,
        ...storeInfoData
      } = store;
      reset({
        ...storeInfoData,
      });
    }
  }, [isLoading, reset, isFormInfoDirty, store]);

  const handleSaveData: SubmitHandler<EditStoreInputs> = async (data) => {
    setRequestState((prev) => ({ ...prev, isLoading: true }));
    if (!store) {
      setRequestState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Data tidak ditemukan",
      }));
      return;
    }
    if (!userToken) {
      setRequestState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Unauthorize",
      }));
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data];
      if (value) {
        formData.append(key, value);
      }
    });
    if (!!selectedImage) {
      formData.append("image", selectedImage);
    }

    const result = await updateStore(store?.slug, formData, userToken);
    if (!result.success) {
      setRequestState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.message,
      }));
      return;
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_STORE],
    });

    setRequestState((prev) => ({
      ...prev,
      isLoading: false,
      error: "",
      success: true,
    }));
    return;
  };

  const imagePreview = selectedImage
    ? URL.createObjectURL(selectedImage)
    : store?.image || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
      <div className="col-span-full space-y-3">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/seller",
            },
            {
              title: "Toko",
              href: "/seller/store",
            },
            {
              title: "Pengaturan",
              href: "/seller/store/settings",
            },
          ]}
        />

        {!!requestState.error && (
          <Alerts variant="danger">Error: {requestState.error}</Alerts>
        )}
        {requestState.success && (
          <Alerts variant="success">Data berhasil diperbarui</Alerts>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Ubah Info Toko
          </h1>
          {(isFormInfoDirty || !!selectedImage) && (
            <Button
              onClick={formInfoSubmit(handleSaveData)}
              size="sm"
              variant="primary"
              disabled={requestState.isLoading}
              isLoading={requestState.isLoading}
            >
              <MdSave className="text-base" />
              <span>Simpan perubahan</span>
            </Button>
          )}
        </div>
      </div>

      <div className="col-span-full lg:col-span-1 flex flex-col gap-2 lg:gap-4">
        <StoreInfoForm formData={formData} />
      </div>

      <div className="col-span-full lg:col-span-1 flex flex-col gap-2 lg:gap-4">
        <StoreImageUpload
          imagePreview={imagePreview}
          onFileChange={setSelectedImage}
        />
        <StoreBannerManage
          storeSlug={store?.slug || ""}
          store_banners={store?.store_banners || []}
        />
      </div>
    </div>
  );
}

type StoreInfoFormProps = {
  formData: UseFormReturn<EditStoreInputs, any, undefined>;
};

function StoreInfoForm({ formData }: StoreInfoFormProps) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = formData;

  const { province_id: currentProvinceId, city_id: currentCityId } = watch();

  const { data: provinceList } = useQuery({
    queryKey: [QueryKeys.STORE_GET_PROVINCE],
    queryFn: () => getProvince(),
  });

  const { data: cityList, isLoading: loadingCities } = useQuery({
    queryKey: [QueryKeys.STORE_GET_CITES, currentProvinceId],
    queryFn: () => getCities(currentProvinceId),
    enabled: !!currentProvinceId,
  });

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
    setValue("province_id", province.province_id);
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
    setValue("city_id", city.city_id);
    setValue("postal_code", city.postal_code);
  }, [currentCityId, setValue, cityList]);

  const provinceOptions = (provinceList || []).map((item) => ({
    title: item.province,
    value: item.province_id,
  }));
  const cityOptions = (cityList || []).map((item) => ({
    title: item.city_name,
    value: item.city_id,
  }));

  return (
    <BaseCard className="space-y-4 flex-grow">
      <h2 className="text-xl font-semibold">Informasi Toko</h2>
      <div className="space-y-3">
        <FormInput
          {...register("name")}
          type="text"
          id="name"
          label="Nama toko"
          placeholder="Masukan nama toko anda"
          error={errors.name?.message}
        />

        <FormArea
          {...register("store_description")}
          id="store_description"
          label="Deskripsi Toko"
          placeholder="Masukan deskripsi toko anda"
          rows={8}
          error={errors.store_description?.message}
        />

        <FormInput
          {...register("phone_number")}
          type="text"
          id="phone_number"
          label="Nomor telepon toko"
          placeholder="Masukan nomor telepon toko anda"
          error={errors.phone_number?.message}
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
      </div>
    </BaseCard>
  );
}

type StoreImageUploadProps = {
  onFileChange?: (file: File) => void;
  imagePreview?: string;
  storeName?: string;
};

function StoreImageUpload({
  onFileChange,
  storeName,
  imagePreview,
}: StoreImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange && onFileChange(file);
    }
  };

  return (
    <BaseCard className="space-y-4">
      <div className="w-60 h-60 bg-cover bg-center relative rounded overflow-hidden">
        {!!imagePreview && (
          <Image
            src={imagePreview}
            alt={storeName || ""}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-all duration-200"
            sizes="(max-width: 768px) 25vw, 25vw"
          />
        )}
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Foto Profil Toko</h2>
        <p className="text-gray-400 text-sm">JPG, JPEG or PNG. Maksimal 1 MB</p>
        <div className="flex">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="primary"
          >
            <MdUpload className="text-base" />
            <span>Unggah Foto</span>
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="file-image"
          id="file-image"
          hidden
          onChange={handleFileImageChange}
        />
      </div>
    </BaseCard>
  );
}

type StoreBannerManageProps = {
  store_banners: StoreBanner[];
  storeSlug: string;
};

function StoreBannerManage({ store_banners }: StoreBannerManageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (store_banners.length >= 3) {
      console.log(
        `Gagal, makasimal 3 banner, saat ini anda punya ${store_banners.length} banner`
      );
      return;
    }

    // TODO Process image upload
  };

  const handleDeleteImage = async (imageId: string) => {
    // TODO Process image delete
  };

  return (
    <BaseCard className="space-y-4 flex-grow">
      <h2 className="text-xl font-semibold">Banner Toko</h2>

      <BannerCarousel>
        {store_banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full h-60 relative overflow-hidden group"
          >
            <Image
              src={banner.image}
              alt=""
              fill
              sizes="50vh"
              loading="lazy"
              className="object-cover rounded"
            />
            <div className="absolute left-0 bottom-0 w-full h-40 bg-gradient-to-t from-black/70 p-3 flex justify-center items-end lg:-mb-20 group-hover:mb-0 transition-all">
              <Button
                onClick={() => handleDeleteImage(banner.id)}
                variant="danger"
              >
                <MdDeleteOutline className="text-2xl" />
              </Button>
            </div>
          </div>
        ))}
      </BannerCarousel>

      <div className="space-y-3">
        <p className="text-gray-400 text-sm">JPG, JPEG or PNG. Maksimal 1 MB</p>
        <div className="flex">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="primary"
          >
            <MdAddToPhotos className="text-base" />
            <span>Tambah Banner</span>
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="file-image"
          id="file-image"
          hidden
          onChange={handleFileImageChange}
        />
      </div>
    </BaseCard>
  );
}

function BannerCarousel({ children }: PropsWithChildren) {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  return (
    <div className="relative">
      <Carousel
        draggable
        swipeable
        responsive={responsive}
        showDots={false}
        autoPlay={false}
        removeArrowOnDeviceType={["tablet", "mobile"]}
        autoPlaySpeed={5000}
        arrows={true}
        infinite
      >
        {children}
      </Carousel>
    </div>
  );
}
