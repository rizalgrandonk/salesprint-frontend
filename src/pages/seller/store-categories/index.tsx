import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonLink } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import {
  createStoreCategory,
  deleteStoreCategory,
  getStoreCategories,
  updateStoreCategory,
} from "@/lib/api/storeCategories";
import { getUserStore } from "@/lib/api/stores";
import { slugify } from "@/lib/formater";
import { sleep } from "@/lib/sleep";
import toast from "@/lib/toast";
import { Store, StoreCategory } from "@/types/Store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import {
  MdAdd,
  MdAddToPhotos,
  MdEdit,
  MdFilePresent,
  MdFileUpload,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineStorefront,
} from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export default function StoreCategories() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const storeSlug = store?.slug;

  const { data: storeCategories, isLoading: isLoadingStoreCategories } =
    useQuery({
      queryKey: [QueryKeys.STORE_CATEGORIES, storeSlug],
      queryFn: () =>
        storeSlug
          ? getStoreCategories(storeSlug, {
              withCount: ["products"],
            })
          : null,
      enabled: !!storeSlug,
    });

  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<StoreCategory | null>(null);

  const [searchKey, setSearchKey] = useState("");

  const toggleModalOpen = async (banner: StoreCategory | null) => {
    if (isModalOpen) {
      setIsModalOpen(false);
      await sleep(200);
      setSelectedCategory(null);
      return;
    }
    setIsModalOpen(true);
    await sleep(200);
    setSelectedCategory(banner);
    return;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!userToken) {
      console.log("Unauthorize, no user token");
      return;
    }
    if (!store) {
      console.log("Error store not found");
      return;
    }

    const prevData = queryClient.getQueryData<StoreCategory[]>([
      QueryKeys.STORE_CATEGORIES,
      storeSlug,
    ]);
    if (prevData) {
      queryClient.setQueryData(
        [QueryKeys.STORE_CATEGORIES, storeSlug],
        prevData.filter((category) => category.id !== categoryId)
      );
    }

    const result = await deleteStoreCategory(store.slug, categoryId, userToken);

    if (!result.success) {
      queryClient.setQueryData(
        [QueryKeys.STORE_CATEGORIES, storeSlug],
        prevData
      );
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.STORE_CATEGORIES, storeSlug],
    });
  };

  const createOrUpdateStoreCategory = async (
    storeSlug: string,
    data: FormData,
    token: string,
    categoryId?: string
  ) => {
    if (!categoryId) {
      return await createStoreCategory(storeSlug, data, token);
    }
    return await updateStoreCategory(storeSlug, categoryId, data, token);
  };

  const handleSubmitCategory = async (data: StoreCategoryForm) => {
    const { name, image } = data;
    if (!selectedCategory && storeCategories && storeCategories.length >= 10) {
      toast.error(`Gagal, makasimal 10 kategori`);
      return;
    }

    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    if (!store) {
      toast.error("Data tidak ditemukan");
      return;
    }

    const slug = slugify(name);

    if (
      !selectedCategory &&
      storeCategories?.some((category) => category.slug === slug)
    ) {
      toast.error("Kategori sudah ada");
      return;
    }

    const formData = new FormData();
    if (image instanceof File) {
      formData.append("image", image);
    }
    formData.append("name", name);
    formData.append("slug", slug);

    const prevData = queryClient.getQueryData<StoreCategory[]>([
      QueryKeys.STORE_CATEGORIES,
      storeSlug,
    ]);
    if (prevData) {
      const newCategory: StoreCategory = {
        id: "pending",
        name: name,
        image: image instanceof File ? URL.createObjectURL(image) : image,
        slug: slug,
        products_count: 0,
      };
      const newCategories = !selectedCategory
        ? [...(prevData || []), newCategory]
        : (prevData || []).map((banner) =>
            banner.id !== selectedCategory.id ? banner : newCategory
          );
      queryClient.setQueryData(
        [QueryKeys.STORE_CATEGORIES, storeSlug],
        newCategories
      );
    }

    const result = await createOrUpdateStoreCategory(
      store.slug,
      formData,
      userToken,
      selectedCategory?.id
    );

    if (!result || !result.success) {
      queryClient.setQueryData(
        [QueryKeys.STORE_CATEGORIES, storeSlug],
        prevData
      );
      toast.error("Gagal, " + result.message);
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.STORE_CATEGORIES, storeSlug],
    });
    toast.success("Success, " + result.message);
  };

  if (isLoadingStore || isLoadingStoreCategories) {
    return <LoadingSpinner />;
  }

  if (!store) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  if (!storeCategories) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store categories data not found
      </Alerts>
    );
  }

  const filteredCategories = searchKey
    ? storeCategories.filter((category) =>
        category.name
          .toLocaleLowerCase()
          .includes(searchKey.toLocaleLowerCase())
      )
    : storeCategories;

  return (
    <>
      <div className="space-y-2 lg:space-y-4 px-3 lg:px-5 py-1">
        <div className="col-span-full space-y-2 lg:space-y-4">
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
                title: "Etalase",
                href: "/seller/store-categories",
              },
            ]}
          />

          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Kategori Toko (Etalase)
          </h1>

          <div className="flex flex-col lg:flex-row gap-2 justify-between items-center">
            <FormInput
              className="text-sm w-80"
              id="category-search"
              placeholder="Cari Etalase"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <Button
              onClick={() => toggleModalOpen(null)}
              size="sm"
              variant="primary"
              href="#"
            >
              <MdAdd className="text-base" />
              <span>Tambah Kategori Baru</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 py-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              onEdit={() => toggleModalOpen(category)}
              onDelete={() => handleDeleteCategory(category.id)}
              category={category}
            />
          ))}
        </div>
      </div>

      <CategoryFormModal
        key={selectedCategory?.id || "add"}
        isOpen={isModalOpen}
        onClose={() => toggleModalOpen(null)}
        onSubmit={(data) => handleSubmitCategory(data)}
        defaultFormValue={
          selectedCategory
            ? {
                name: selectedCategory.name,
                image: selectedCategory.image,
              }
            : undefined
        }
        isEdit={!!selectedCategory}
      />
    </>
  );
}

type CategoryCardProps = {
  category: StoreCategory;
  onEdit?: (category: StoreCategory) => void;
  onDelete?: (category: StoreCategory) => void;
};

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <BaseCard
      key={category.id}
      className={twMerge(
        "overflow-hidden h-36 flex p-0",
        category.id === "pending" ? "opacity-70" : ""
      )}
    >
      {category.image ? (
        <div className="w-28 h-full bg-cover bg-center relative overflow-hidden">
          <Image
            src={category.image}
            alt={category.name}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-all duration-200"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      ) : (
        <div className="w-24 h-full bg-cover bg-center relative overflow-hidden">
          <MdOutlineStorefront className="text-4xl" />
        </div>
      )}
      <div className="py-2 px-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-medium">{category.name}</h3>
          <span className="text-gray-500">{`${category.products_count} produk`}</span>
        </div>
        {category.id !== "pending" && (
          <div className="flex justify-end items-center gap-2">
            <Button
              onClick={() => onEdit && onEdit(category)}
              variant="info"
              size="sm"
            >
              <MdOutlineEdit className="text-lg" />
            </Button>
            <Button
              onClick={() => onDelete && onDelete(category)}
              variant="danger"
              size="sm"
            >
              <MdOutlineDelete className="text-lg" />
            </Button>
          </div>
        )}
      </div>
    </BaseCard>
  );
}

const storeCategorySchema = z.object({
  name: z
    .string({ required_error: "Nama harus diisi" })
    .min(1, "Nama harus diisi"),
  image: z.union([
    z.string({ required_error: "Gambar harus diisi" }),
    typeof window === "undefined"
      ? z.string()
      : z.instanceof(File, { message: "Gambar harus diisi" }),
  ]),
});

type StoreCategoryForm = z.infer<typeof storeCategorySchema>;

type CategoryFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreCategoryForm) => void;
  defaultFormValue?: Partial<StoreCategoryForm>;
  isEdit?: boolean;
};

const defaultValue = {
  name: undefined,
  image: undefined,
};

function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultFormValue,
  isEdit,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<StoreCategoryForm>>(
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

    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = () => {
    const validation = storeCategorySchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.message);
      return;
    }

    const data = validation.data;

    onSubmit(data);
    setFormData(defaultFormValue ?? defaultValue);
    onClose();
  };

  const imagePreviewUrl =
    formData.image instanceof File
      ? URL.createObjectURL(formData.image)
      : formData.image;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Tambah Kategori Toko</h3>
      </div>
      <div className="py-4 space-y-4">
        <FormInput
          id="name"
          label="Nama Kategori"
          placeholder="Masukan nama kategori"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          value={formData.name}
        />

        <div className="space-y-1">
          <span className="text-base">Gambar Kategori</span>
          {imagePreviewUrl ? (
            <div className="w-full h-48 bg-cover bg-center relative rounded overflow-hidden">
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
              className="w-full h-48 relative rounded overflow-hidden flex justify-center items-center gap-4 flex-col border border-gray-400 dark:border-gray-500 cursor-pointer text-gray-400 dark:text-gray-500"
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
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
        {isEdit ? (
          <Button onClick={handleSubmit} variant="primary">
            <MdEdit className="text-base" />
            <span>Edit Kategori Toko</span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="primary">
            <MdAddToPhotos className="text-base" />
            <span>Tambah Kategori Toko</span>
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
