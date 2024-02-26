import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import {
  createVariantType,
  deleteVariantType,
  updateVariantType,
} from "@/lib/api/variantTypes";
import { sleep } from "@/lib/sleep";
import toast from "@/lib/toast";
import { VariantType } from "@/types/Variant";
import { PaginatedData } from "@/types/data";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdEdit,
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

export default function VariantTypeListPage() {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const {
    data: variantTypes,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setSearchKey,
    setLimit,
    refetch,
    isFetching,
  } = useDataTable<VariantType>(QueryKeys.PAGINATED_VARIANT_TYPES, {
    orderBy: {
      field: "created_at",
      value: "desc",
    },
  });

  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VariantType | null>(null);

  const toggleModalOpen = async (item: VariantType | null) => {
    if (isModalOpen) {
      setIsModalOpen(false);
      await sleep(200);
      setSelectedItem(null);
      return;
    }
    setIsModalOpen(true);
    await sleep(200);
    setSelectedItem(item);
    return;
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!userToken) {
      console.log("Unauthorize, no user token");
      return;
    }

    const prevData = queryClient.getQueryData<PaginatedData<VariantType[]>>([
      QueryKeys.PAGINATED_VARIANT_TYPES,
      queryState,
    ]);
    if (prevData) {
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_VARIANT_TYPES, queryState],
        {
          ...prevData,
          data: prevData.data.filter((item) => item.id !== itemId),
        }
      );
    }

    const result = await deleteVariantType(itemId, userToken);

    if (!result.success) {
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_VARIANT_TYPES, queryState],
        prevData
      );

      toast.error("Gagal, " + result.message);
    } else {
      toast.success("Berhasil hapus variant type");
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PAGINATED_VARIANT_TYPES, queryState],
    });
  };

  const createOrUpdateItem = async (
    data: ItemForm,
    token: string,
    itemId?: string
  ) => {
    if (!itemId) {
      return await createVariantType(data, token);
    }
    return await updateVariantType(itemId, data, token);
  };

  const handleSubmitCategory = async (data: ItemForm) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const prevData = queryClient.getQueryData<PaginatedData<VariantType[]>>([
      QueryKeys.PAGINATED_VARIANT_TYPES,
      queryState,
    ]);
    if (prevData) {
      const newItem: VariantType = !selectedItem
        ? {
            id: "pending",
            name: data.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : {
            ...selectedItem,
            id: "pending",
            name: data.name,
          };
      const newList = !selectedItem
        ? [newItem, ...(prevData.data || [])]
        : (prevData.data || []).map((category) =>
            category.id !== selectedItem.id ? category : newItem
          );
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_VARIANT_TYPES, queryState],
        {
          ...prevData,
          data: newList,
        }
      );
    }

    const result = await createOrUpdateItem(data, userToken, selectedItem?.id);

    if (!result || !result.success) {
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_VARIANT_TYPES, queryState],
        prevData
      );
      toast.error("Gagal, " + result.message);
    } else {
      toast.success(
        "Success, " +
          (selectedItem ? "memperbarui variant type" : "menambah variant type")
      );
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PAGINATED_VARIANT_TYPES, queryState],
    });
  };

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!variantTypes) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Gagal memuat data
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
                title: "Daftar Tipe Varian",
                href: "/admin/variant-types",
              },
            ]}
          />

          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Daftar Tipe Varian
          </h1>

          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <FormInput
              className="text-sm w-full lg:w-80"
              id="category-search"
              placeholder="Cari Tipe Varian"
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
                Tambah Tipe Varian Baru
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          isFetching={isFetching || isLoading}
          list={variantTypes}
          columns={[
            {
              id: "name",
              header: {
                render: "Nama",
              },
              cell: {
                render: (item) => item.name,
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
                          setSelectedItem(item);
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

      <ItemFormModal
        key={selectedItem?.id || "add"}
        isOpen={isModalOpen}
        onClose={() => toggleModalOpen(null)}
        onSubmit={(data) => handleSubmitCategory(data)}
        defaultFormValue={
          selectedItem
            ? {
                name: selectedItem.name,
              }
            : undefined
        }
        isEdit={!!selectedItem}
      />

      <DeleteItemModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={async () => {
          if (!selectedItem?.id) {
            return;
          }
          await handleDeleteItem(selectedItem.id);
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
}

type DeleteItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function DeleteItemModal({ isOpen, onClose, onSubmit }: DeleteItemModalProps) {
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
        <h3 className="text-2xl font-medium leading-6">Tambah Tipe Varian</h3>
      </div>
      <div className="py-4 space-y-4">
        Anda yakin ingin menghapus tipe varian
      </div>
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

const itemSchema = z.object({
  name: z
    .string({ required_error: "Nama harus diisi" })
    .min(1, "Nama harus diisi"),
});

type ItemForm = z.infer<typeof itemSchema>;

type ItemFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemForm) => void;
  defaultFormValue?: Partial<ItemForm>;
  isEdit?: boolean;
};

const defaultValue = {
  name: undefined,
};

function ItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultFormValue,
  isEdit,
}: ItemFormModalProps) {
  const [formData, setFormData] = useState<Partial<ItemForm>>(
    defaultFormValue ?? defaultValue
  );

  const handleSubmit = () => {
    const validation = itemSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.message);
      return;
    }

    const data = validation.data;

    onSubmit(data);
    setFormData(defaultFormValue ?? defaultValue);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Tambah Tipe Varian</h3>
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
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
        {isEdit ? (
          <Button onClick={handleSubmit} variant="primary">
            <MdEdit className="text-base" />
            <span>Edit Tipe Varian</span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="primary">
            <MdAdd className="text-base" />
            <span>Tambah Tipe Varian</span>
          </Button>
        )}
      </div>
    </BaseModal>
  );
}
