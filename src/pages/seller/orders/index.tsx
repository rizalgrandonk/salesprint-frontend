import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import Badge from "@/components/utils/Badge";
import BaseCard from "@/components/utils/BaseCard";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonMenu } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import {
  acceptOrder,
  cancelOrder,
  deliveredOrder,
  shipOrder,
} from "@/lib/api/orders";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import toast from "@/lib/toast";
import { ORDER_STATUS_MAP, Order } from "@/types/Order";
import { MakePropertiesRequired } from "@/types/data";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  MdCheck,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdOutlineCancelScheduleSend,
  MdOutlineLocalShipping,
  MdRefresh,
} from "react-icons/md";
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
  const router = useRouter();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const [selectedItem, setSelectedItem] = useState<MakePropertiesRequired<
    Order,
    "transaction" | "order_items" | "store" | "user"
  > | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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

  const handleAcceptOrder = async () => {
    if (!selectedItem) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await acceptOrder(userToken, {
      order_number: selectedItem.order_number,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Menerima Pesanan");
    setIsAcceptModalOpen(false);
    setSelectedItem(null);
    refetch();
  };
  const handleShipOrder = async (data: {
    shipping_tracking_number: string;
    shipping_days_estimate: number;
  }) => {
    if (!selectedItem) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await shipOrder(userToken, {
      order_number: selectedItem.order_number,
      ...data,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Atur Pengiriman");
    setIsShipModalOpen(false);
    setSelectedItem(null);
    refetch();
  };
  const handleDeliveredOrder = async () => {
    if (!selectedItem) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await deliveredOrder(userToken, {
      order_number: selectedItem.order_number,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Menerima Pesanan");
    setIsDeliveredModalOpen(false);
    setSelectedItem(null);
    refetch();
  };
  const handleCancelOrder = async (data: { cancel_reason: string }) => {
    if (!selectedItem) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await cancelOrder(userToken, {
      order_number: selectedItem.order_number,
      ...data,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Membatalkan Pesanan");
    setIsCancelModalOpen(false);
    setSelectedItem(null);
    refetch();
  };

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
            <div
              key={key}
              className="flex-grow flex-shrink-0 font-medium text-center"
            >
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
                {ORDER_STATUS_MAP[key as keyof typeof ORDER_STATUS_MAP]}
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
              id: "Deliveredy_cost",
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
                  const options = [
                    {
                      title: "Detail Pesanan",
                      onClick: () =>
                        router.push(`/seller/orders/${item.order_number}`),
                    },
                    {
                      title: "Batalkan Pesanan",
                      onClick: () => {
                        setSelectedItem(item);
                        setIsCancelModalOpen(true);
                      },
                    },
                  ].filter((opt) => {
                    if (
                      opt.title === "Batalkan Pesanan" &&
                      item.order_status !== "PAID" &&
                      item.order_status !== "PROCESSED"
                    ) {
                      return false;
                    }
                    return true;
                  });

                  return (
                    <div className="flex flex-col items-stretch gap-2">
                      {item.order_status === "PAID" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsAcceptModalOpen(true);
                          }}
                        >
                          Terima Pesanan
                        </Button>
                      )}
                      {item.order_status === "PROCESSED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsShipModalOpen(true);
                          }}
                        >
                          Atur Pengiriman
                        </Button>
                      )}
                      {item.order_status === "SHIPPED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeliveredModalOpen(true);
                          }}
                        >
                          Pesanan Terkirim
                        </Button>
                      )}
                      <ButtonMenu
                        title="Menu"
                        variant="info"
                        size="sm"
                        className="w-full"
                        outline
                        options={options}
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

      <AcceptOrderModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          setIsAcceptModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleAcceptOrder}
      />
      <ShipOrderModal
        isOpen={isShipModalOpen}
        onClose={() => {
          setIsShipModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleShipOrder}
      />
      <DeliveredOrderModal
        isOpen={isDeliveredModalOpen}
        onClose={() => {
          setIsDeliveredModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleDeliveredOrder}
      />
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleCancelOrder}
      />
    </>
  );
}

type AcceptOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
};

function AcceptOrderModal({
  isOpen,
  onClose,
  onSubmit,
}: AcceptOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    await onSubmit();

    setIsLoading(false);
    onClose();
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Terima Pesanan</h3>
      </div>
      <div className="py-4 space-y-4">Anda akan menerima pesanan</div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
        <Button onClick={onClose} variant="secondary">
          <MdClose className="text-base" />
          <span>Batal</span>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <MdCheck className="text-base" />
          <span>Terima Pesanan</span>
        </Button>
      </div>
    </BaseModal>
  );
}

type ShipOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    shipping_tracking_number: string;
    shipping_days_estimate: number;
  }) => Promise<void> | void;
};

function ShipOrderModal({ isOpen, onClose, onSubmit }: ShipOrderModalProps) {
  const [formData, setFormData] = useState({
    shipping_tracking_number: "",
    shipping_days_estimate: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (Object.values(formData).some((val) => !val)) {
      return;
    }
    await onSubmit({
      ...formData,
      shipping_days_estimate: Number(formData.shipping_days_estimate),
    });

    setIsLoading(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Atur Pengiriman</h3>
      </div>
      <div className="py-4 space-y-4">
        <FormInput
          required
          label="Nomor Resi Pengiriman"
          type="text"
          id="shipping_tracking_number"
          name="shipping_tracking_number"
          value={formData.shipping_tracking_number}
          onChange={(e) => {
            return setFormData((prev) => ({
              ...prev,
              shipping_tracking_number: e.target.value,
            }));
          }}
        />
        <FormInput
          required
          label="Estimasi Waktu Pengiriman"
          type="number"
          id="shipping_days_estimate"
          name="shipping_days_estimate"
          value={formData.shipping_days_estimate}
          onChange={(e) => {
            return setFormData((prev) => ({
              ...prev,
              shipping_days_estimate: e.target.value,
            }));
          }}
          elementRight="Hari"
        />
      </div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
        <Button onClick={onClose} variant="secondary">
          <MdClose className="text-base" />
          <span>Batal</span>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <MdOutlineLocalShipping className="text-base" />
          <span>Atur Pengiriman</span>
        </Button>
      </div>
    </BaseModal>
  );
}

type DeliveredOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
};

function DeliveredOrderModal({
  isOpen,
  onClose,
  onSubmit,
}: DeliveredOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    await onSubmit();

    setIsLoading(false);
    onClose();
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Pesanan Terkirim</h3>
      </div>
      <div className="py-4 space-y-4">
        Anda yakin pesanan telah terkirim ke penerima
      </div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
        <Button onClick={onClose} variant="secondary">
          <MdClose className="text-base" />
          <span>Batal</span>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <MdCheck className="text-base" />
          <span>Pesanan Terkirim</span>
        </Button>
      </div>
    </BaseModal>
  );
}

type CancelOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { cancel_reason: string }) => Promise<void> | void;
};

function CancelOrderModal({
  isOpen,
  onClose,
  onSubmit,
}: CancelOrderModalProps) {
  const [formData, setFormData] = useState({
    cancel_reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    setIsLoading(true);

    if (Object.values(formData).some((val) => !val)) {
      return;
    }
    await onSubmit(formData);

    setIsLoading(false);
    onClose();
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">Batalkan Pesanan</h3>
      </div>
      <div className="py-4 space-y-4">
        <FormInput
          required
          label="Alasan Pembatalan"
          type="text"
          id="cancel_reason"
          name="cancel_reason"
          value={formData.cancel_reason}
          onChange={(e) => {
            return setFormData((prev) => ({
              ...prev,
              cancel_reason: e.target.value,
            }));
          }}
        />
      </div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
        <Button onClick={onClose} variant="secondary">
          <MdClose className="text-base" />
          <span>Batal</span>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="danger"
          disabled={isLoading}
          isLoading={isLoading}
        >
          <MdOutlineCancelScheduleSend className="text-base" />
          <span>Batalkan</span>
        </Button>
      </div>
    </BaseModal>
  );
}
