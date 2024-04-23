import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import Meta from "@/components/utils/Meta";
import QueryKeys from "@/constants/queryKeys";
import { getUserInfo } from "@/lib/api/auth";
import { updateUser } from "@/lib/api/users";
import { DEFAULT_USER_IMAGE } from "@/lib/constants";
import { EditUserForm, editUserSchema } from "@/types/User";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { MdSave, MdUpload } from "react-icons/md";

export default function Profile() {
  const { data: session, update: updateSession } = useSession();

  const userData = session?.user;
  const userToken = userData?.access_token;
  const userId = userData?.id;

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_PROFILE, userId],
    queryFn: () => (userToken ? getUserInfo(userToken) : null),
    enabled: !!userId && !!userToken,
  });

  const [requestState, setRequestState] = useState({
    isLoading: false,
    error: "",
    success: false,
  });

  const {
    id,
    role,
    image,
    created_at,
    updated_at,
    email_verified_at,
    ...userInfoData
  } = profile || {};

  const formData = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    mode: "all",
    defaultValues: {
      ...userInfoData,
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
    if (profile) {
      const {
        id,
        role,
        image,
        created_at,
        updated_at,
        email_verified_at,
        ...userInfoData
      } = profile;
      reset({
        ...userInfoData,
      });
    }
  }, [isLoading, reset, isFormInfoDirty, profile]);

  const handleSaveData: SubmitHandler<EditUserForm> = async (data) => {
    setRequestState((prev) => ({ ...prev, isLoading: true }));

    if (!userToken || !userId) {
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

    const result = await updateUser(userId, formData, userToken);
    if (!result.success) {
      setRequestState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.message,
      }));

      toast.error(result.message ?? "Failed to update");
      return;
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_PROFILE],
    });

    setRequestState((prev) => ({
      ...prev,
      isLoading: false,
      error: "",
      success: true,
    }));

    updateSession();

    toast.success("Data berhasil diperbarui");
    return;
  };

  const imagePreview = selectedImage
    ? URL.createObjectURL(selectedImage)
    : profile?.image || "";

  console.log("imagePreview", imagePreview);
  console.log("profile", profile);

  return (
    <>
      <Meta title="Profil | Salesprint" />
      <div className="py-4 lg:py-8 container flex flex-col lg:flex-row gap-6 lg:items-start">
        <BaseCard className="p-0 flex-shrink-0 lg:w-80 lg:sticky top-28 divide-y divide-gray-200 dark:divide-gray-700">
          <div className="px-4 py-3 flex items-center gap-4">
            <div className="relative h-14 aspect-square rounded-full overflow-hidden">
              <Image
                src={userData?.image || DEFAULT_USER_IMAGE}
                alt={userData?.username ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold my-0 leading-none">
                {userData?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 my-0 leading-none">
                {userData?.email}
              </p>
            </div>
          </div>
          <ul className="py-3" role="none">
            <li>
              <Link
                href={"/user/orders"}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Pesanan
              </Link>
            </li>
            <li>
              <Link
                href={`/user/profile`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Profil
              </Link>
            </li>
            <li>
              <Link
                href={`/user/reviews`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Ulasan
              </Link>
            </li>
          </ul>
        </BaseCard>

        <div className="flex-grow space-y-4 overflow-x-hidden">
          <div className="flex justify-between items-center">
            <h1 className="font-semibold text-2xl">Profil Pengguna</h1>
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
          <ProfileSection
            formData={formData}
            imagePreview={imagePreview}
            onFileChange={setSelectedImage}
          />
        </div>
      </div>
    </>
  );
}

type ProfileSectionProps = {
  formData: UseFormReturn<EditUserForm, any, undefined>;
};

function ProfileSection({
  formData,
  ...uploadImageProps
}: ProfileSectionProps & ProfileImageUploadProps) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = formData;

  return (
    <>
      <BaseCard className="w-full p-2 lg:p-4 flex items-start gap-8">
        <ProfileImageUpload {...uploadImageProps} />
        <div className="space-y-3 flex-1">
          <FormInput
            {...register("name")}
            type="text"
            id="name"
            label="Nama toko"
            placeholder="Masukan nama toko anda"
            error={errors.name?.message}
          />

          <FormInput
            {...register("email")}
            type="email"
            id="email"
            label="Email"
            placeholder="Masukan email anda"
            error={errors.email?.message}
          />

          <FormInput
            {...register("username")}
            type="text"
            id="username"
            label="Nama Pengguna"
            placeholder="Masukan nama pengguna anda"
            error={errors.username?.message}
          />

          <FormInput
            {...register("phone_number")}
            type="text"
            id="phone_number"
            label="Nomor telepon toko"
            placeholder="Masukan nomor telepon toko anda"
            error={errors.phone_number?.message}
          />
        </div>
      </BaseCard>
    </>
  );
}

type ProfileImageUploadProps = {
  onFileChange?: (file: File) => void;
  imagePreview?: string;
  name?: string;
};

function ProfileImageUpload({
  onFileChange,
  name,
  imagePreview,
}: ProfileImageUploadProps) {
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
    <div className="space-y-4">
      <div className="w-60 h-60 bg-cover bg-center relative rounded overflow-hidden">
        {!!imagePreview && (
          <Image
            src={imagePreview}
            alt={name || ""}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-all duration-200"
            sizes="(max-width: 768px) 25vw, 25vw"
          />
        )}
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Foto Profil</h2>
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
    </div>
  );
}
