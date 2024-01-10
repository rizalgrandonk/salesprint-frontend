import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button } from "@/components/utils/Button";
import FormArea from "@/components/utils/FormArea";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import QueryKeys from "@/constants/queryKeys";
import {
  createStoreBanner,
  deleteStoreBanner,
  updateStoreBanner,
} from "@/lib/api/storeBanners";
import {
  getCities,
  getProvince,
  getUserStore,
  updateStore,
} from "@/lib/api/stores";
import { sleep } from "@/lib/sleep";
import toast from "@/lib/toast";
import {
  EditStoreInputs,
  Store,
  StoreBanner,
  editStoreSchema,
} from "@/types/Store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, {
  Fragment,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import {
  MdAddToPhotos,
  MdEdit,
  MdFilePresent,
  MdFileUpload,
  MdOutlineDelete,
  MdOutlineEdit,
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
      toast.error("Data tidak ditemukan");
      return;
    }
    if (!userToken) {
      setRequestState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Unauthorize",
      }));
      toast.error("Unauthorize");
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
    toast.success("Data berhasil diperbarui");
    return;
  };

  const imagePreview = selectedImage
    ? URL.createObjectURL(selectedImage)
    : store?.image || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 px-3 lg:px-5 py-1">
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
        <StoreBannerManage store={store} />
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
  store?: Store | null;
};

type StoreBannerForm = {
  file: File | string;
  description?: string;
};

function StoreBannerManage({ store }: StoreBannerManageProps) {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const [selectedBanner, setSelectedBanner] = useState<StoreBanner | null>(
    null
  );

  const queryClient = useQueryClient();

  const store_banners = store?.store_banners || [];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const createOrUpdateStoreBanner = async (
    storeSlug: string,
    data: FormData,
    token: string,
    bannerId?: string
  ) => {
    if (!bannerId) {
      return await createStoreBanner(storeSlug, data, token);
    }
    return await updateStoreBanner(storeSlug, bannerId, data, token);
  };

  const handleSubmitBanner = async (data: StoreBannerForm) => {
    const { file, description } = data;
    if (!selectedBanner && store_banners.length >= 3) {
      toast.error("Gagal, makasimal 3 banner");
      return;
    }

    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    if (!store) {
      toast.error("Gagal, data tidak ditemukan");
      return;
    }

    const formData = new FormData();
    if (file instanceof File) {
      formData.append("image", file);
    }
    if (description) {
      formData.append("description", description);
    }

    const prevData = queryClient.getQueryData<Store>([
      QueryKeys.USER_STORE,
      userId,
    ]);
    if (prevData) {
      const newBanner = {
        id: "pending",
        description: description,
        image: file instanceof File ? URL.createObjectURL(file) : file,
      };
      const newBanners = !selectedBanner
        ? [...(prevData.store_banners || []), newBanner]
        : (prevData.store_banners || []).map((banner) =>
            banner.id !== selectedBanner.id ? banner : newBanner
          );
      queryClient.setQueryData([QueryKeys.USER_STORE, userId], {
        ...prevData,
        store_banners: newBanners,
      });
    }

    const result = await createOrUpdateStoreBanner(
      store.slug,
      formData,
      userToken,
      selectedBanner?.id
    );

    if (!result || !result.success) {
      queryClient.setQueryData([QueryKeys.USER_STORE, userId], prevData);
      toast.error(`Gagal submit, ${result.message}`);
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_STORE, userId],
    });
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!userToken) {
      console.log("Unauthorize, no user token");
      return;
    }
    if (!store) {
      console.log("Error store not found");
      return;
    }

    const prevData = queryClient.getQueryData<Store>([
      QueryKeys.USER_STORE,
      userId,
    ]);
    if (prevData && prevData.store_banners) {
      queryClient.setQueryData([QueryKeys.USER_STORE, userId], {
        ...prevData,
        store_banners: prevData.store_banners.filter(
          (banner) => banner.id !== bannerId
        ),
      });
    }

    const result = await deleteStoreBanner(store.slug, bannerId, userToken);

    if (!result.success) {
      queryClient.setQueryData([QueryKeys.USER_STORE, userId], prevData);
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_STORE, userId],
    });
  };

  const toggleModalOpen = async (banner: StoreBanner | null) => {
    if (isModalOpen) {
      setIsModalOpen(false);
      await sleep(200);
      setSelectedBanner(null);
      return;
    }
    setIsModalOpen(true);
    await sleep(200);
    setSelectedBanner(banner);
    return;
  };

  return (
    <Fragment>
      <BaseCard className="space-y-4 flex-grow">
        <h2 className="text-xl font-semibold">Banner Toko</h2>

        <BannerCarousel>
          {store_banners.map((banner, index) => (
            <div
              key={banner.id + index}
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
              <div className="absolute left-0 bottom-0 w-full h-40 bg-gradient-to-t from-black/70 py-3 flex justify-end items-end lg:-mb-20 group-hover:mb-0 transition-all divide-x">
                <p className="truncate flex-grow px-3 text-gray-100 text-sm">
                  {banner.description}
                </p>
                {banner.id !== "pending" && (
                  <div className="flex items-center gap-2 px-3">
                    <Button
                      onClick={() => toggleModalOpen(banner)}
                      variant="info"
                      size="sm"
                    >
                      <MdOutlineEdit className="text-xl" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteBanner(banner.id)}
                      variant="danger"
                      size="sm"
                    >
                      <MdOutlineDelete className="text-xl" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </BannerCarousel>

        <div className="space-y-3">
          <Button
            onClick={() => toggleModalOpen(null)}
            size="sm"
            variant="primary"
          >
            <MdAddToPhotos className="text-base" />
            <span>Tambah Banner</span>
          </Button>
        </div>
      </BaseCard>

      <BannerFormModal
        key={selectedBanner?.id || "Add"}
        isOpen={isModalOpen}
        onClose={() => toggleModalOpen(null)}
        onSubmit={handleSubmitBanner}
        defaultFormValue={
          selectedBanner
            ? {
                description: selectedBanner.description,
                file: selectedBanner.image,
              }
            : undefined
        }
        isEdit={!!selectedBanner}
      />
    </Fragment>
  );
}

type BannerFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreBannerForm) => void;
  defaultFormValue?: Partial<StoreBannerForm>;
  isEdit?: boolean;
};

const defaultValue = {
  file: undefined,
  description: undefined,
};

function BannerFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultFormValue,
  isEdit,
}: BannerFormModalProps) {
  const [formData, setFormData] = useState<Partial<StoreBannerForm>>(
    defaultFormValue ?? defaultValue
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFormData((prev) => ({ ...prev, file: file }));
  };

  const handleSubmit = () => {
    const selectedFile = formData.file;
    if (!selectedFile) {
      toast.error("No Selected file");
      return;
    }

    onSubmit({ file: selectedFile, description: formData.description });
    setFormData(defaultFormValue ?? defaultValue);
    onClose();
  };

  const imagePreviewUrl =
    formData.file instanceof File
      ? URL.createObjectURL(formData.file)
      : formData.file;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-3xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Tambah Banner</h3>
      </div>
      <div className="py-4 flex items-start gap-4">
        <div className="space-y-1">
          <span className="text-base">File Banner</span>
          {imagePreviewUrl ? (
            <div className="w-72 h-32 bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={imagePreviewUrl}
                alt="New Banner"
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-all duration-200"
                sizes="(max-width: 768px) 25vw, 25vw"
              />
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-72 h-32 relative rounded overflow-hidden flex justify-center items-center gap-4 flex-col border border-gray-400 dark:border-gray-500 cursor-pointer text-gray-400 dark:text-gray-500"
            >
              <MdFilePresent className="text-6xl" />
              <span>Pilih File</span>
            </div>
          )}
          <p className="text-gray-400 text-xs">
            JPG, JPEG or PNG. Maksimal 1 MB
          </p>
          <div className="flex">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="primary"
            >
              <MdFileUpload className="text-base" />
              <span>Pilih File</span>
            </Button>
          </div>
        </div>

        <div className="space-y-1 flex-grow">
          <FormArea
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            value={formData.description}
            className="text-sm"
            id="description"
            label="Deskripsi Banner"
            rows={5}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
        {isEdit ? (
          <Button onClick={handleSubmit} variant="primary">
            <MdEdit className="text-base" />
            <span>Edit Banner</span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="primary">
            <MdAddToPhotos className="text-base" />
            <span>Tambah Banner</span>
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        name="file-image"
        id="file-image"
        hidden
        onChange={handleFileImageChange}
      />
    </BaseModal>
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
