import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonMenu } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/api/categories";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { slugify } from "@/lib/formater";
import { sleep } from "@/lib/sleep";
import toast from "@/lib/toast";
import { Category } from "@/types/Category";
import { PaginatedData } from "@/types/data";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import {
  MdAdd,
  MdAddToPhotos,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdEdit,
  MdFilePresent,
  MdFileUpload,
  MdOutlineDelete,
  MdOutlineEdit,
  MdRefresh,
} from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import { z } from "zod";

const limitOptions = [10, 20, 30, 50, 100].map((limit) => ({
  title: limit.toString(),
  value: limit.toString(),
}));

export default function CategoryListPage() {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const {
    data: categories,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setSearchKey,
    setLimit,
    refetch,
    isFetching,
  } = useDataTable<Category>(QueryKeys.PAGINATED_CATEGORIES, {
    orderBy: {
      field: "created_at",
      value: "desc",
    },
    withCount: ["products"],
  });

  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const toggleModalOpen = async (banner: Category | null) => {
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

  const handleDeleteCategory = async (categorySlug: string) => {
    if (!userToken) {
      console.log("Unauthorize, no user token");
      return;
    }

    const prevData = queryClient.getQueryData<PaginatedData<Category[]>>([
      QueryKeys.PAGINATED_CATEGORIES,
      queryState,
    ]);
    if (prevData) {
      queryClient.setQueryData([QueryKeys.PAGINATED_CATEGORIES, queryState], {
        ...prevData,
        data: prevData.data.filter(
          (category) => category.slug !== categorySlug
        ),
      });
    }

    const result = await deleteCategory(categorySlug, userToken);

    if (!result.success) {
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_CATEGORIES, queryState],
        prevData
      );

      toast.error("Gagal, " + result.message);
    } else {
      toast.success("Berhasil hapus kategori");
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PAGINATED_CATEGORIES, queryState],
    });
  };

  const createOrUpdateCategory = async (
    data: FormData,
    token: string,
    categorySlug?: string
  ) => {
    if (!categorySlug) {
      return await createCategory(data, token);
    }
    return await updateCategory(categorySlug, data, token);
  };

  const handleSubmitCategory = async (data: CategoryForm) => {
    const { name, image } = data;

    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const slug = slugify(name);

    const formData = new FormData();
    if (image instanceof File) {
      formData.append("image", image);
    }
    formData.append("name", name);
    formData.append("slug", slug);

    const prevData = queryClient.getQueryData<PaginatedData<Category[]>>([
      QueryKeys.PAGINATED_CATEGORIES,
      queryState,
    ]);
    if (prevData) {
      const newCategory: Category = !selectedCategory
        ? {
            id: "pending",
            name: name,
            image: image instanceof File ? URL.createObjectURL(image) : image,
            slug: slug,
            products_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : {
            ...selectedCategory,
            id: "pending",
            name: name,
            image: image instanceof File ? URL.createObjectURL(image) : image,
            slug: slug,
          };
      const newCategories = !selectedCategory
        ? [newCategory, ...(prevData.data || [])]
        : (prevData.data || []).map((category) =>
            category.id !== selectedCategory.id ? category : newCategory
          );
      queryClient.setQueryData([QueryKeys.PAGINATED_CATEGORIES, queryState], {
        ...prevData,
        data: newCategories,
      });
    }

    const result = await createOrUpdateCategory(
      formData,
      userToken,
      selectedCategory?.slug
    );

    if (!result || !result.success) {
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_CATEGORIES, queryState],
        prevData
      );
      toast.error("Gagal, " + result.message);
    } else {
      toast.success(
        "Success, " +
          (selectedCategory ? "memperbarui kategori" : "menambah kategori")
      );
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PAGINATED_CATEGORIES, queryState],
    });
  };

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!categories) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  return (
    <>
      <div className="space-y-2 lg:space-y-4 flex flex-col h-[88vh]">
        <div className="col-span-full space-y-2 px-3 lg:px-5 py-1">
          <Breadcrumb
            navList={[
              {
                title: "Beranda",
                href: "/admin",
              },
              {
                title: "Daftar Kategori",
                href: "/admin/categories",
              },
            ]}
          />

          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Daftar Katagori
          </h1>

          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <FormInput
              className="text-sm w-full lg:w-80"
              id="category-search"
              placeholder="Cari Kategori"
              value={queryState.search?.value}
              onChange={(e) =>
                setSearchKey({
                  field: "name",
                  value: e.target.value,
                })
              }
            />

            <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
              <Button onClick={() => refetch()} variant="base" outline>
                <MdRefresh className="text-base" />
              </Button>
              <Button onClick={() => toggleModalOpen(null)}>
                <MdAdd className="text-xl" />
                Tambah Kategori Baru
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          isFetching={isFetching || isLoading}
          list={categories}
          columns={[
            {
              id: "name",
              header: {
                render: "Nama Kategori",
              },
              cell: {
                render: (item) => (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 relative rounded-full">
                      <Image
                        src={item.image || DEFAULT_STORE_CATEGORY_IMAGE}
                        alt={item.name || ""}
                        fill
                        sizes="2rem"
                        loading="lazy"
                        className="object-cover rounded-full"
                      />
                    </div>
                    <span>{item.name}</span>
                  </div>
                ),
              },
            },
            {
              id: "products_count",
              header: {
                render: "Jumlah Produk",
              },
              cell: {
                render: (item) => item.products_count || 0,
              },
            },
            {
              id: "created_at",
              header: {
                render: "Tanggal Pembuatan",
              },
              cell: {
                className: "text-gray-500 dark:text-gray-400",
                render: (item) =>
                  format(new Date(item.created_at), "dd MMM yyyy"),
              },
            },
            {
              id: "action",
              header: {
                render: "Aksi",
              },
              cell: {
                render: (item) => {
                  if (item.id === "pending") {
                    return null;
                  }
                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleModalOpen(item)}
                        size="sm"
                        variant="info"
                        outline
                      >
                        <MdOutlineEdit />
                        Ubah
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedCategory(item);
                          setIsDeleteModalOpen(true);
                        }}
                        size="sm"
                        variant="danger"
                        outline
                      >
                        <MdOutlineDelete />
                        Hapus
                      </Button>
                    </div>
                  );
                },
              },
            },
          ]}
        />

        <div className="flex justify-between items-center px-3 lg:px-5 py-1">
          <div className="flex items-center gap-2">
            <FormSelect
              className="text-xs w-20"
              id="table-limit"
              options={limitOptions}
              value={queryState.limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
            <div className="text-gray-500 text-sm">
              Menampilkan{" "}
              <span className="text-gray-800 dark:text-gray-100">
                {summaryData?.from || 0}
              </span>{" "}
              -{" "}
              <span className="text-gray-800 dark:text-gray-100">
                {summaryData?.to || 0}
              </span>{" "}
              dari{" "}
              <span className="text-gray-800 dark:text-gray-100">
                {summaryData?.total || 0}
              </span>{" "}
              data
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!!previousPage && (
              <Button onClick={() => previousPage()} size="sm">
                <MdChevronLeft className="text-xl" />
                <span>Sebelumnya</span>
              </Button>
            )}
            {!!nextPage && (
              <Button onClick={() => nextPage()} size="sm">
                <span>Berikutnya</span>
                <MdChevronRight className="text-xl" />
              </Button>
            )}
          </div>
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

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={async () => {
          if (!selectedCategory?.slug) {
            return;
          }
          await handleDeleteCategory(selectedCategory.slug);
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
      />
    </>
  );
}

type DeleteCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function DeleteCategoryModal({
  isOpen,
  onClose,
  onSubmit,
}: DeleteCategoryModalProps) {
  const handleSubmit = () => {
    onSubmit();
    onClose();
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Hapus Kategori</h3>
      </div>
      <div className="py-4 space-y-4">Anda yakin ingin menghapus kategori</div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
        <Button onClick={onClose} variant="secondary">
          <MdClose className="text-base" />
          <span>Batal</span>
        </Button>
        <Button onClick={handleSubmit} variant="danger">
          <MdOutlineDelete className="text-base" />
          <span>Hapus</span>
        </Button>
      </div>
    </BaseModal>
  );
}

const categorySchema = z.object({
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

type CategoryForm = z.infer<typeof categorySchema>;

type CategoryFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryForm) => void;
  defaultFormValue?: Partial<CategoryForm>;
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
  const [formData, setFormData] = useState<Partial<CategoryForm>>(
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
    const validation = categorySchema.safeParse(formData);
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
        <h3 className="text-2xl font-medium leading-6">Tambah Kategori</h3>
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
            <span>Edit Kategori</span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="primary">
            <MdAddToPhotos className="text-base" />
            <span>Tambah Kategori</span>
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
