import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import Badge from "@/components/utils/Badge";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonMenu } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import { updateStoreStatus } from "@/lib/api/stores";
import { DEFAULT_STORE_IMAGE } from "@/lib/constants";
import toast from "@/lib/toast";
import { Store } from "@/types/Store";
import { PaginatedData } from "@/types/data";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MdChevronLeft, MdChevronRight, MdRefresh } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";

const limitOptions = [10, 20, 30, 50, 100].map((limit) => ({
  title: limit.toString(),
  value: limit.toString(),
}));

const statusOptions = [
  {
    title: "ON REVIEW",
    value: "on_review",
  },
  {
    title: "APPROVED",
    value: "approved",
  },
  {
    title: "REJECTED",
    value: "rejected",
  },
];

const statusTextMap = {
  on_review: "ON REVIEW",
  approved: "APPROVED",
  rejected: "REJECTED",
} as const;

const statusVariantMap = {
  on_review: "warning",
  approved: "success",
  rejected: "danger",
} as const;

export default function StoreListPage() {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const {
    data: stores,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setSearchKey,
    setLimit,
    setFilter,
    refetch,
    isFetching,
  } = useDataTable<Store>(QueryKeys.PAGINATED_STORES, {
    orderBy: {
      field: "created_at",
      value: "desc",
    },
    withCount: ["products"],
    with: ["user"],
  });

  const queryClient = useQueryClient();

  const statusFilter = queryState.filters?.find(
    (filter) => filter.field === "status"
  );

  const handleUpdateStatus = async (
    slug: string,
    newStatus: Store["status"]
  ) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const prevData = queryClient.getQueryData<PaginatedData<Store[]>>([
      QueryKeys.PAGINATED_STORES,
      queryState,
    ]);

    if (prevData) {
      const updatedList = prevData.data.map((store) => {
        if (store.slug === slug) {
          return {
            ...store,
            id: "pending",
            status: newStatus,
          };
        }
        return store;
      });

      queryClient.setQueryData([QueryKeys.PAGINATED_STORES, queryState], {
        ...prevData,
        data: updatedList,
      });
    }

    const result = await updateStoreStatus(
      slug,
      { status: newStatus },
      userToken
    );

    if (!result || !result.success) {
      queryClient.setQueryData(
        [QueryKeys.PAGINATED_STORES, queryState],
        prevData
      );
      toast.error("Gagal, " + result.message);
    }

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PAGINATED_STORES, queryState],
    });
    toast.success("Success update store status ");
  };

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stores) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  return (
    <div className="space-y-2 lg:space-y-4 flex flex-col h-[88vh]">
      <div className="col-span-full space-y-2 lg:space-y-4 px-3 lg:px-5 py-1">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/admin",
            },
            {
              title: "Daftar Toko",
              href: "/admin/stores",
            },
          ]}
        />

        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Daftar Toko
        </h1>

        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <FormInput
            className="text-sm w-full lg:w-80"
            id="category-search"
            placeholder="Cari Toko"
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
            <FormSelect
              className="text-sm w-full lg:w-80"
              id="category-search"
              placeholder="Filter Status"
              options={statusOptions}
              value={statusFilter?.value}
              onChange={(e) =>
                setFilter([
                  {
                    field: "status",
                    value: e.target.value,
                    operator: "=",
                  },
                ])
              }
            />
          </div>
        </div>
      </div>

      <DataTable
        isFetching={isFetching || isLoading}
        list={stores}
        columns={[
          {
            id: "name",
            header: {
              render: "Nama Toko",
            },
            cell: {
              render: (store) => (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 relative rounded-full">
                    <Image
                      src={store.image || DEFAULT_STORE_IMAGE}
                      alt={store.name || ""}
                      fill
                      sizes="2rem"
                      loading="lazy"
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span>{store.name}</span>
                    <span className="text-sm text-gray-500">
                      {store?.user?.email || ""}
                    </span>
                  </div>
                </div>
              ),
            },
          },
          {
            id: "phone_number",
            header: {
              render: "Nomor Telepon",
            },
            cell: {
              render: (store) => store.phone_number,
            },
          },
          {
            id: "city",
            header: {
              render: "Kota",
            },
            cell: {
              render: (store) => store.city,
            },
          },
          {
            id: "status",
            header: {
              render: "Status",
            },
            cell: {
              render: (store) => (
                <Badge
                  className="rounded-full"
                  variant={statusVariantMap[store.status]}
                  size="sm"
                >
                  {statusTextMap[store.status]}
                </Badge>
              ),
            },
          },
          {
            id: "created_at",
            header: {
              render: "Tanggal Pembuatan",
            },
            cell: {
              className: "text-gray-500 dark:text-gray-400",
              render: (store) =>
                format(new Date(store.created_at), "dd MMM yyyy"),
            },
          },
          {
            id: "action",
            header: {
              render: "Aksi",
            },
            cell: {
              render: (store) => {
                const options = [
                  {
                    title: "Approve",
                    onClick: () => handleUpdateStatus(store.slug, "approved"),
                  },
                  {
                    title: "Reject",
                    onClick: () => handleUpdateStatus(store.slug, "rejected"),
                  },
                ].filter((opt) => {
                  if (store.id === "pending") {
                    return false;
                  }
                  if (opt.title === "Approve" && store.status === "approved") {
                    return false;
                  }
                  if (opt.title === "Reject" && store.status === "rejected") {
                    return false;
                  }
                  return true;
                });
                return (
                  <ButtonMenu
                    title="Perbarui Status"
                    variant="base"
                    outline
                    options={options}
                  />
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
  );
}
