import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonLink } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import { getAllCategories } from "@/lib/api/categories";
import { deleteProduct } from "@/lib/api/products";
import { getStoreCategories } from "@/lib/api/storeCategories";
import { getUserStore } from "@/lib/api/stores";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice, htmlToPlainText } from "@/lib/formater";
import toast from "@/lib/toast";
import { Product } from "@/types/Product";
import { PaginatedData } from "@/types/data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdOutlineDelete,
  MdOutlineEdit,
  MdRefresh,
} from "react-icons/md";
import { RiInformationLine, RiStarFill } from "react-icons/ri";

const limitOptions = [10, 20, 30, 50, 100].map((limit) => ({
  title: limit.toString(),
  value: limit.toString(),
}));

const sortOptions = [
  {
    title: "Terbaru Dibuat",
    value: "created_at|desc",
  },
  {
    title: "Terlama Dibuat",
    value: "created_at|asc",
  },
  {
    title: "Harga Tertinggi",
    value: "price|desc",
  },
  {
    title: "Harga Terendah",
    value: "price|asc",
  },
  {
    title: "Rating Tertinggi",
    value: "average_rating|desc",
  },
  {
    title: "Rating Terendah",
    value: "average_rating|asc",
  },
  {
    title: "Stok Tertinggi",
    value: "stok|desc",
  },
  {
    title: "Stok Terendah",
    value: "stok|asc",
  },
];

export default function StoreProductListPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const storeSlug = store?.slug;

  const path = `/paginated/stores/${storeSlug}/products/`;

  const {
    data: products,
    summaryData,
    isLoading: isLoadingProducts,
    queryState,
    nextPage,
    previousPage,
    setSearchKey,
    setLimit,
    setOrderBy,
    setFilter,
    refetch,
    isFetching,
  } = useDataTable<Product>(
    path,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      with: ["category", "store_category", "product_images"],
      withCount: ["reviews", "product_variants"],
    },
    !!storeSlug
  );

  const { data: categories } = useQuery({
    queryKey: [QueryKeys.ALL_CATEGORIES],
    queryFn: () => getAllCategories(),
  });

  const { data: storeCategories } = useQuery({
    queryKey: [QueryKeys.STORE_CATEGORIES, storeSlug],
    queryFn: () => (storeSlug ? getStoreCategories(storeSlug) : null),
    enabled: !!storeSlug,
  });

  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);

  const categoryFilter = queryState.filters?.find(
    (fil) => fil.field === "category_id"
  );
  const storeCategoryFilter = queryState.filters?.find(
    (fil) => fil.field === "store_category_id"
  );

  const handleDelete = async (productSlug: string) => {
    if (!userToken) {
      console.log("Unauthorize, no user token");
      return;
    }
    if (!storeSlug) {
      console.log("Data toko tidak ditemukan");
      return;
    }

    const prevData = queryClient.getQueryData<PaginatedData<Product[]>>([
      path,
      queryState,
    ]);
    if (prevData) {
      queryClient.setQueryData([path, queryState], {
        ...prevData,
        data: prevData.data.filter((item) => item.slug !== productSlug),
      });
    }

    const result = await deleteProduct(storeSlug, productSlug, userToken);

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

  if (isLoadingStore || isLoadingProducts) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!store) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  if (!products) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Products data not found
      </Alerts>
    );
  }

  return (
    <>
      <div className="space-y-2 lg:space-y-4 flex flex-col h-[88vh]">
        <div className="col-span-full space-y-2 lg:space-y-4 px-3 lg:px-5 py-1">
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
                title: "Daftar Produk",
                href: "/seller/products",
              },
            ]}
          />

          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              Daftar Produk
            </h1>

            <ButtonLink href="/seller/products/create">
              <MdAdd className="text-xl" />
              Tambah Produk Baru
            </ButtonLink>
          </div>

          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between lg:flex-wrap">
            <FormInput
              className="text-sm w-full lg:w-80"
              id="search"
              placeholder="Cari Produk"
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

              {!!categories && (
                <FormSelect
                  className="text-sm w-full lg:w-48"
                  id="filter-category"
                  placeholder="Filter Kategori"
                  options={categories.map((category) => ({
                    title: category.name,
                    value: category.id,
                  }))}
                  value={categoryFilter?.value}
                  onChange={(e) =>
                    setFilter([
                      {
                        field: "category_id",
                        value: e.target.value || null,
                        operator: "=",
                      },
                    ])
                  }
                />
              )}

              {!!storeCategories && (
                <FormSelect
                  className="text-sm w-full lg:w-48"
                  id="filter-category"
                  placeholder="Filter Etalase"
                  options={storeCategories.map((category) => ({
                    title: category.name,
                    value: category.id,
                  }))}
                  value={storeCategoryFilter?.value}
                  onChange={(e) =>
                    setFilter([
                      {
                        field: "store_category_id",
                        value: e.target.value || null,
                        operator: "=",
                      },
                    ])
                  }
                />
              )}

              <FormSelect
                className="text-sm w-full lg:w-48"
                id="sort"
                placeholder="Urutan"
                options={sortOptions}
                value={`${queryState.orderBy?.field}|${queryState.orderBy?.value}`}
                onChange={(e) => {
                  const text = e.target.value;
                  if (!text || text === "") {
                    return setOrderBy(null);
                  }
                  const [field, value] = text.split("|");
                  if (!field || !value) {
                    return setOrderBy(null);
                  }
                  return setOrderBy({
                    field: field as keyof Product,
                    value: value as "asc" | "desc",
                  });
                }}
              />
            </div>
          </div>
        </div>

        <DataTable
          isFetching={isFetching || isLoadingProducts}
          list={products}
          columns={[
            {
              id: "name",
              header: {
                render: "Nama Produk",
              },
              cell: {
                className: "whitespace-normal",
                render: (item) => (
                  <div className="flex gap-4">
                    <div className="w-20 h-28 relative rounded-sm overflow-hidden">
                      <Image
                        src={
                          item.product_images?.find((image) => image.main_image)
                            ?.image_url ||
                          item.product_images?.[0]?.image_url ||
                          DEFAULT_STORE_CATEGORY_IMAGE
                        }
                        alt={item.name || ""}
                        fill
                        sizes="8rem"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-52">
                      <span>{item.name}</span>
                      <p className="text-xs font-light text-gray-500 dark:text-gray-400 line-clamp-4">
                        {htmlToPlainText(item.description)}
                      </p>
                    </div>
                  </div>
                ),
              },
            },
            {
              id: "price",
              header: {
                render: "Harga",
              },
              cell: {
                render: (item) => formatPrice(item.price || 0),
              },
            },
            {
              id: "category",
              header: {
                render: "Kategori",
              },
              cell: {
                render: (item) => item.category?.name || "",
              },
            },
            {
              id: "store_category",
              header: {
                render: "Etalase",
              },
              cell: {
                render: (item) => item.store_category?.name || "",
              },
            },
            {
              id: "average_rating",
              header: {
                render: "Rating",
              },
              cell: {
                render: (item) => (
                  <div className="flex items-end gap-2">
                    <RiStarFill className="text-yellow-500 text-base" />
                    <span className="font-medium leading-none">
                      {item.average_rating}
                    </span>
                  </div>
                ),
              },
            },
            {
              id: "stok",
              header: {
                render: "Jumlah Stok",
              },
              cell: {
                className: "text-gray-500 dark:text-gray-400",
                render: (item) => item.stok,
              },
            },
            {
              id: "product_variants_count",
              header: {
                render: "Jumlah Varian",
              },
              cell: {
                render: (item) => item.product_variants_count,
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
                      <ButtonLink
                        href={`/seller/products/edit/${item.slug}`}
                        size="sm"
                        variant="info"
                        outline
                      >
                        <MdOutlineEdit />
                        Atur
                      </ButtonLink>
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

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={async () => {
          if (!selectedItem?.slug) {
            return;
          }
          await handleDelete(selectedItem.slug);
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
}

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function DeleteModal({ isOpen, onClose, onSubmit }: DeleteModalProps) {
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
        <h3 className="text-2xl font-medium leading-6">Hapus Produk</h3>
      </div>
      <div className="py-4 space-y-4">Anda yakin ingin menghapus produk</div>
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
