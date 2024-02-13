import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import Badge from "@/components/utils/Badge";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonMenu } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import { ORDER_STATUS_MAP, Order } from "@/types/Order";
import { MakePropertiesRequired } from "@/types/data";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MdChevronLeft, MdChevronRight, MdRefresh } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

const limitOptions = [10, 20, 30, 50, 100].map((limit) => ({
  title: limit.toString(),
  value: limit.toString(),
}));

const sortOptions = [
  {
    title: "Pesanan Terbaru",
    value: "created_at|desc",
  },
  {
    title: "Pesanan Terlama",
    value: "created_at|asc",
  },
];

export default function OrlderListPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const {
    data: orders,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setOrderBy,
    setFilter,
    setSearchKey,
    setLimit,
    refetch,
    isFetching,
  } = useDataTable<
    MakePropertiesRequired<
      Order,
      "transaction" | "order_items" | "store" | "user"
    >
  >(
    QueryKeys.PAGINATED_STORE_ORDERS,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      with: [
        "transaction",
        "order_items",
        "user",
        "store",
        "order_items.product",
        "order_items.product_variant",
        "order_items.product_variant.variant_options",
        "order_items.product_variant.variant_options.variant_type",
        "order_items.product.product_images",
      ],
    },
    {
      enabled: !!userToken,
      token: userToken,
      queryKey: [QueryKeys.PAGINATED_STORE_ORDERS, userToken],
    }
  );

  const statusFilter = queryState.filters?.find(
    (fil) => fil.field === "order_status"
  );

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!orders) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Orders data not found
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
                title: "Daftar Pesanan",
                href: "/seller/orders",
              },
            ]}
          />

          <div className="flex flex-col lg:flex-row gap-2 items-center">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              Daftar Pesanan
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between lg:flex-wrap">
            <FormInput
              className="text-sm w-full lg:w-80"
              id="search"
              placeholder="Cari Produk"
              value={queryState.search?.value}
              onChange={(e) =>
                setSearchKey({
                  field: "order_number",
                  value: e.target.value,
                })
              }
            />

            <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
              <Button onClick={() => refetch()} variant="base" outline>
                <MdRefresh className="text-base" />
              </Button>

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
                    field: field as keyof Order,
                    value: value as "asc" | "desc",
                  });
                }}
              />
            </div>
          </div>
        </div>

        <BaseCard className="flex items-center gap-4">
          <div className="flex-grow flex-shrink-0 font-medium text-center">
            <span
              className={twMerge(
                "pb-1 px-2 border-b-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 hover:dark:text-white",
                !statusFilter
                  ? "text-primary dark:text-primary border-primary"
                  : "border-transparent"
              )}
              onClick={() =>
                setFilter([
                  { field: "order_status", operator: "=", value: null },
                ])
              }
            >
              Semua
            </span>
          </div>
          {Object.keys(ORDER_STATUS_MAP).map((key) => (
            <div className="flex-grow flex-shrink-0 font-medium text-center">
              <span
                className={twMerge(
                  "pb-1 px-2 border-b-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 hover:dark:text-white",
                  statusFilter?.value === key
                    ? "text-primary dark:text-primary border-primary"
                    : "border-transparent"
                )}
                onClick={() =>
                  setFilter([
                    { field: "order_status", operator: "=", value: key },
                  ])
                }
              >
                {ORDER_STATUS_MAP[key]}
              </span>
            </div>
          ))}
        </BaseCard>

        <DataTable
          isFetching={isFetching || isLoading}
          list={orders}
          columns={[
            {
              id: "product",
              header: {
                render: "Produk",
              },
              cell: {
                className: "whitespace-normal align-top",
                render: (item) => (
                  <div className="space-y-2">
                    {item.order_items.map((order_item) => (
                      <div className="flex gap-2 items-start">
                        <div className="w-16 aspect-square relative rounded-sm overflow-hidden">
                          <Image
                            src={
                              order_item.product?.product_images?.find(
                                (image) => image.main_image
                              )?.image_url ||
                              order_item.product?.product_images?.[0]
                                ?.image_url ||
                              DEFAULT_STORE_CATEGORY_IMAGE
                            }
                            alt={order_item.product?.name ?? ""}
                            fill
                            sizes="8rem"
                            loading="lazy"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-52">
                          <span className="line-clamp-2 leading-tight">
                            {order_item.product?.name}
                          </span>
                          <div className="space-y-0.5">
                            {order_item.product_variant?.variant_options?.map(
                              (opt) => (
                                <p className="leading-none text-xs text-gray-500 dark:text-gray-400">
                                  {`${opt.variant_type?.name}: ${opt.value}`}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {formatPrice(
                              order_item.product_variant?.price ?? 0
                            )}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-primary">
                              x
                            </span>
                            <span className="font-semibold text-primary">
                              {order_item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
            },
            {
              id: "order_number",
              header: {
                render: "Nomor Pesanan",
              },
              cell: {
                className: "text-primary dark:text-primary text-sm align-top",
                render: (item) => item.order_number,
              },
            },
            {
              id: "total",
              header: {
                render: "Harga",
              },
              cell: {
                className: "text-sm font-light align-top",
                render: (item) => formatPrice(item.total || 0),
              },
            },
            {
              id: "delivery_cost",
              header: {
                render: "Alokasi Pengiriman",
              },
              cell: {
                className: "text-sm font-light align-top",
                render: (item) => formatPrice(item.delivery_cost || 0),
              },
            },
            {
              id: "order_status",
              header: {
                render: "Status",
              },
              cell: {
                className: "align-top",
                render: (item) => (
                  <Badge className="rounded-full" variant={"primary"}>
                    {ORDER_STATUS_MAP[item.order_status]}
                  </Badge>
                ),
              },
            },
            {
              id: "customer",
              header: {
                render: "Pembeli",
              },
              cell: {
                className: "align-top",
                render: (item) => item.user.name,
              },
            },
            {
              id: "created_at",
              header: {
                render: "Tanggal Pemesanan",
              },
              cell: {
                className: "text-gray-500 dark:text-gray-400 align-top",
                render: (item) =>
                  format(new Date(item.created_at), "dd MMM yyyy HH:mm"),
              },
            },
            {
              id: "action",
              header: {
                render: "Aksi",
              },
              cell: {
                className: "align-top",
                render: (item) => {
                  return (
                    <div className="flex flex-col items-stretch gap-2">
                      {item.order_status === "PAID" && (
                        <Button variant="primary" size="sm" className="w-full">
                          Terima Pesanan
                        </Button>
                      )}
                      {item.order_status === "PROCESSED" && (
                        <Button variant="primary" size="sm" className="w-full">
                          Atur Pengiriman
                        </Button>
                      )}
                      <ButtonMenu
                        title="Menu"
                        variant="info"
                        size="sm"
                        className="w-full"
                        outline
                        options={[
                          {
                            title: "Detail Pesanan",
                            onClick: () => undefined,
                          },
                          {
                            title: "Batalkan Pesanan",
                            onClick: () => undefined,
                          },
                        ]}
                      />
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
    </>
  );
}
