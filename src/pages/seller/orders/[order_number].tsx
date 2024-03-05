import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button } from "@/components/utils/Button";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import {
  acceptOrder,
  cancelOrder,
  deliveredOrder,
  getStoreOrder,
  shipOrder,
} from "@/lib/api/orders";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_USER_IMAGE,
} from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import toast from "@/lib/toast";
import { ORDER_STATUS_MAP } from "@/types/Order";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { MdLabelImportant, MdLabelImportantOutline } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import {
  AcceptOrderModal,
  CancelOrderModal,
  DeliveredOrderModal,
  ShipOrderModal,
} from ".";

export default function OrderDetailPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const router = useRouter();
  const orderNumber = router.query.order_number?.toString();

  console.log({ router });

  const {
    data: order,
    isLoading: isLoading,
    refetch,
  } = useQuery({
    queryKey: [QueryKeys.STORE_ORDERS, orderNumber],
    queryFn: () =>
      !!userToken && !!orderNumber
        ? getStoreOrder<"transaction" | "order_items" | "store" | "user">(
            userToken,
            orderNumber,
            {
              with: [
                "transaction",
                "user",
                "order_items",
                "store",
                "order_items.product",
                "order_items.product.store",
                "order_items.product.product_images",
                "order_items.product_variant.variant_options",
              ],
            }
          )
        : null,
    enabled: !!userToken && !!orderNumber,
  });

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Order data not found
      </Alerts>
    );
  }

  const timelines = [
    {
      title: "Pesanan selesai",
      date: order?.completed_at,
    },
    {
      title: "Pesanan dibatalkan",
      date: order?.canceled_at,
    },
    {
      title: "Pesanan teleah terkirim ke tujuan",
      date: order?.delivered_at,
    },
    {
      title: "Pesanan teleah dikirim",
      date: order?.shipped_at,
    },
    {
      title: "Pesanan dikonfirmasi penjual",
      date: order?.accepted_at,
    },
    {
      title: "Pesanan telah dibayar",
      date: order?.paid_at,
    },
    {
      title: "Pesanan dibuat",
      date: order?.created_at,
    },
  ].reduce((acc, curr) => {
    const date = curr.date;
    if (!!date) {
      return [...acc, { ...curr, date }];
    }
    return acc;
  }, [] as { title: string; date: string }[]);

  const handleAcceptOrder = async () => {
    if (!order) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await acceptOrder(userToken, {
      order_number: order.order_number,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Menerima Pesanan");
    setIsAcceptModalOpen(false);
    refetch();
  };
  const handleShipOrder = async (data: {
    shipping_tracking_number: string;
    shipping_days_estimate: number;
  }) => {
    if (!order) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await shipOrder(userToken, {
      order_number: order.order_number,
      ...data,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Atur Pengiriman");
    setIsShipModalOpen(false);
    refetch();
  };
  const handleDeliveredOrder = async () => {
    if (!order) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await deliveredOrder(userToken, {
      order_number: order.order_number,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Menerima Pesanan");
    setIsDeliveredModalOpen(false);
    refetch();
  };
  const handleCancelOrder = async (data: { cancel_reason: string }) => {
    if (!order) {
      toast.error("No itemm selected");
      return;
    }
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    const result = await cancelOrder(userToken, {
      order_number: order.order_number,
      ...data,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Berhasil Membatalkan Pesanan");
    setIsCancelModalOpen(false);
    refetch();
  };

  return (
    <>
      <div className="space-y-2 lg:space-y-4 px-3 lg:px-5 pt-1 pb-6">
        <div className="space-y-2">
          <Breadcrumb
            navList={[
              {
                title: "Beranda",
                href: "/seller",
              },
              {
                title: "Pesanan",
                href: "/seller/orders",
              },
              {
                title: "Detail Pesanan",
                href: `/seller/orders/${orderNumber}`,
              },
            ]}
          />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              Detail Pesanan
            </h1>

            <div className="flex items-center gap-2">
              {(order.order_status === "PAID" ||
                order.order_status === "PROCESSED") && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setIsCancelModalOpen(true);
                  }}
                >
                  Batalkan Pesanan
                </Button>
              )}
              {order.order_status === "PAID" && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setIsAcceptModalOpen(true);
                  }}
                >
                  Terima Pesanan
                </Button>
              )}
              {order.order_status === "PROCESSED" && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setIsShipModalOpen(true);
                  }}
                >
                  Atur Pengiriman
                </Button>
              )}
              {order.order_status === "SHIPPED" && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setIsDeliveredModalOpen(true);
                  }}
                >
                  Pesanan Terkirim
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 lg:space-y-4">
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
            <BaseCard className="space-y-4 flex-grow">
              <h2 className="text-xl font-semibold">Informasi Pembeli</h2>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Nama Pelanggan
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 aspect-square relative rounded-full">
                      <Image
                        src={order.user.image || DEFAULT_USER_IMAGE}
                        alt={order.user.name || ""}
                        fill
                        sizes="2rem"
                        loading="lazy"
                        className="object-cover rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {order.user.name || ""}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Username Pelanggan
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.user.username}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    No. Telepon Pelanggan
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.user.phone_number}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Email Pelanggan
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.user.email}
                  </p>
                </div>
              </div>
            </BaseCard>
            <BaseCard className="space-y-4 flex-grow">
              <h2 className="text-xl font-semibold">Informasi Pengiriman</h2>

              <div className="space-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Nama Penerima
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.reciever_name}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    No. Telepon Penerima
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.reciever_phone}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Alamat
                  </p>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex flex-col">
                    <span>{order.delivery_address}</span>
                    <span>
                      {`${order.delivery_city}, ${order.delivery_province}`}
                    </span>
                    <span>{order.delivery_postal_code}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Kurir
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase">
                    {`${order.shipping_courier} - ${order.delivery_service}`}
                  </p>
                </div>
                {order.shipping_tracking_number && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      No. Resi
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {order.shipping_tracking_number}
                    </p>
                  </div>
                )}
              </div>
            </BaseCard>
          </div>

          <BaseCard className="space-y-4 flex-grow">
            <h2 className="text-xl font-semibold">
              {`Nomor Pesanan: `}
              <span className="text-primary">{order.order_number}</span>
            </h2>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {`${ORDER_STATUS_MAP[order.order_status]} `}
                <span className="text-sm font-normal">{`(${order.order_items.length} Produk) - `}</span>
                <span className="text-base text-gray-600 dark:text-gray-400">
                  {`Waktu Pemesanan: ${format(
                    new Date(order.created_at),
                    "dd MMM yyy, HH:mm"
                  )}`}
                </span>
              </p>

              {order.order_status === "PAID" && order.accept_deadline && (
                <Alerts variant="warning">
                  <RiInformationLine className="text-lg" />
                  {`Pesanan harus diterima sebelum ${format(
                    new Date(order.accept_deadline),
                    "dd-MM-yyyy HH:mm"
                  )}`}
                </Alerts>
              )}
              {order.order_status === "PROCESSED" &&
                order.shipping_deadline && (
                  <Alerts variant="warning">
                    <RiInformationLine className="text-lg" />
                    {`Pesanan harus dikirim sebelum ${format(
                      new Date(order.shipping_deadline),
                      "dd-MM-yyyy HH:mm"
                    )}`}
                  </Alerts>
                )}

              <div className="bg-white dark:bg-gray-900 p-2 rounded">
                <DataTable
                  list={order.order_items}
                  columns={[
                    {
                      id: "product",
                      header: {
                        render: "Produk",
                      },
                      cell: {
                        className: "whitespace-normal align-top text-sm",
                        render: (item) => (
                          <div
                            key={item.id}
                            className="flex gap-2 items-center"
                          >
                            <div className="flex-shrink-0 w-12 aspect-square relative rounded-sm overflow-hidden">
                              <Image
                                src={
                                  item.product?.product_images?.find(
                                    (image) => image.main_image
                                  )?.image_url ||
                                  item.product?.product_images?.[0]
                                    ?.image_url ||
                                  DEFAULT_STORE_CATEGORY_IMAGE
                                }
                                alt={item.product?.name ?? ""}
                                fill
                                sizes="8rem"
                                loading="lazy"
                                className="object-cover"
                              />
                            </div>
                            <span className="line-clamp-2 leading-tight">
                              {item.product?.name}
                            </span>
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
                        className: "text-sm",
                        render: (item) =>
                          formatPrice(item.product_variant?.price ?? 0),
                      },
                    },
                    {
                      id: "sku",
                      header: {
                        render: "SKU",
                      },
                      cell: {
                        className: "text-sm",
                        render: (item) => item.product_variant?.sku,
                      },
                    },
                    {
                      id: "variant",
                      header: {
                        render: "Varian",
                      },
                      cell: {
                        className: "text-sm",
                        render: (item) =>
                          item.product_variant?.variant_options
                            ?.map((opt) => opt.value)
                            .join(", "),
                      },
                    },
                    {
                      id: "quantity",
                      header: {
                        render: "Jumlah",
                      },
                      cell: {
                        className: "text-sm",
                        render: (item) => item.quantity,
                      },
                    },
                  ]}
                />
              </div>
            </div>
          </BaseCard>

          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
            <BaseCard className="space-y-4 flex-grow">
              <h2 className="text-xl font-semibold">Riwayat Pesanan</h2>
              <div className="text-sm space-y-1">
                {timelines.map((timeline, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <span className="w-1/4 text-gray-500 dark:text-gray-400">
                      {format(new Date(timeline.date), "dd MMM yyy, HH:mm")}
                    </span>
                    <div className="flex flex-col items-center gap-1 mt-0.5">
                      {index === 0 ? (
                        <MdLabelImportant className="text-primary" />
                      ) : (
                        <MdLabelImportantOutline className="text-gray-500 dark:text-gray-400" />
                      )}
                      {index < timelines.length - 1 && (
                        <div className="h-4 w-0.5 bg-gray-500 dark:bg-gray-400" />
                      )}
                    </div>
                    <span className="w-1/2 font-medium">{timeline.title}</span>
                  </div>
                ))}
              </div>
            </BaseCard>
            <BaseCard className="space-y-4 flex-grow">
              <h2 className="text-xl font-semibold">Informasi Pembayaran</h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Metode Pembayaran
                </span>
                <span className="font-light uppercase text-primary px-3 py-1 bg-primary/10">
                  {order.transaction.payment_type?.replaceAll("_", " ")}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-start justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {`Total Harga (${order.order_items.reduce(
                      (acc, curr) => acc + curr.quantity,
                      0
                    )} Barang)`}
                  </span>
                  <span className="font-light">
                    {formatPrice(
                      order.order_items.reduce(
                        (acc, curr) =>
                          acc +
                          (curr.product_variant?.price ?? 0) * curr.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Ongkos Kirim
                  </span>
                  <span className="font-light">
                    {formatPrice(order.delivery_cost)}
                  </span>
                </div>
                <div className="h-0.5 bg-gray-500 dark:bg-gray-400" />
                <div className="text-base flex items-start justify-between">
                  <span className="font-semibold">Total Pesanan</span>
                  <span className="font-semibold text-base">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <AcceptOrderModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          setIsAcceptModalOpen(false);
        }}
        onSubmit={handleAcceptOrder}
      />
      <ShipOrderModal
        isOpen={isShipModalOpen}
        onClose={() => {
          setIsShipModalOpen(false);
        }}
        onSubmit={handleShipOrder}
      />
      <DeliveredOrderModal
        isOpen={isDeliveredModalOpen}
        onClose={() => {
          setIsDeliveredModalOpen(false);
        }}
        onSubmit={handleDeliveredOrder}
      />
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
        }}
        onSubmit={handleCancelOrder}
      />
    </>
  );
}
