import BaseCard from "@/components/utils/BaseCard";
import BaseModal from "@/components/utils/BaseModal";
import { Button } from "@/components/utils/Button";
import FormArea from "@/components/utils/FormArea";
import Meta from "@/components/utils/Meta";
import QueryKeys from "@/constants/queryKeys";
import { useCart } from "@/contexts/CartContext";
import useDataTable from "@/hooks/useDataTable";
import { userCompleteOrder } from "@/lib/api/orders";
import { createReviews } from "@/lib/api/reviews";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_USER_IMAGE,
} from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import toast from "@/lib/toast";
import { ORDER_STATUS_MAP, Order, OrderItem, Transaction } from "@/types/Order";
import { MakePropertiesRequired } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  MdArrowDropDown,
  MdArrowRight,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdKeyboardArrowDown,
  MdLabelImportant,
  MdLabelImportantOutline,
  MdOutlineCancelScheduleSend,
  MdOutlineShoppingBag,
  MdOutlineStore,
} from "react-icons/md";
import { RiStarFill, RiStarLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

const ORDER_STATUS_CLASS_MAP: { [key: string]: string } = {
  UNPAID: "text-yellow-500 bg-yellow-500/10",
  PAID: "text-emerald-500 bg-emerald-500/10",
  PROCESSED: "text-emerald-500 bg-emerald-500/10",
  SHIPPED: "text-emerald-500 bg-emerald-500/10",
  DELIVERED: "text-emerald-500 bg-emerald-500/10",
  COMPLETED: "text-emerald-500 bg-emerald-500/10",
  CANCELED: "text-rose-500 bg-rose-500/10",
};

export default function OrderPage() {
  const { data: session } = useSession();

  const userData = session?.user;

  return (
    <>
      <Meta title="Pesanan | Salesprint" />
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
          <h1 className="font-semibold text-2xl">Daftar Pesanan</h1>
          <TransactionSection />
        </div>
      </div>
    </>
  );
}

function TransactionSection() {
  const { data: session } = useSession();

  const { addItem } = useCart();
  const router = useRouter();

  const userData = session?.user;
  const userId = userData?.id;
  const userToken = userData?.access_token;

  const {
    data: orders,
    queryState,
    nextPage,
    previousPage,
    setFilter,
    refetch,
  } = useDataTable<
    MakePropertiesRequired<Order, "transaction" | "order_items" | "store">
  >(
    QueryKeys.PAGINATED_USER_ORDERS,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      limit: 5,
      with: [
        "transaction",
        "order_items",
        "store",
        "order_items.product",
        "order_items.review",
        "order_items.product.store",
        "order_items.product.product_images",
        "order_items.product_variant.variant_options",
      ],
    },
    {
      enabled: !!userToken,
      token: userToken,
      queryKey: [QueryKeys.PAGINATED_USER_ORDERS, userToken],
    }
  );

  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MakePropertiesRequired<
    Order,
    "transaction" | "order_items" | "store"
  > | null>(null);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [isModalReviewOpen, setIsModalReviewOpen] = useState(false);

  useEffect(() => {
    router.prefetch("/cart");
  }, [router]);

  const statusFilter = queryState.filters?.find(
    (fil) => fil.field === "order_status"
  );

  const handleReorder = (
    order: MakePropertiesRequired<
      Order,
      "transaction" | "order_items" | "store"
    >
  ) => {
    order.order_items.forEach((order_item) => {
      const product = order_item.product;
      const productVariant = order_item.product_variant;
      if (!product || !productVariant) {
        return;
      }

      addItem({ product, productVariant, quantity: 1 });
    });
    router.push("/cart");
  };

  const handleCompleteOrder = async (order_number: string) => {
    setIsLoadingRequest(true);

    if (!userToken) {
      toast.error("Unauthorize");
      setIsLoadingRequest(false);
      return;
    }

    const result = await userCompleteOrder(userToken, { order_number });
    if (!result.success) {
      toast.error(result.message);
    }

    refetch();
    setIsLoadingRequest(false);
  };

  const handleCreateReviews = async (
    data: {
      rating: number;
      coment?: string;
      product_id: string;
      product_variant_id: string;
      order_item_id: string;
    }[]
  ) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    setIsLoadingRequest(true);

    const result = await createReviews(userToken, { reviews: data });

    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success("Berhasil memberi ulasan");
    }

    setIsLoadingRequest(false);
    refetch();
  };

  return (
    <>
      <BaseCard className="w-full p-2 lg:p-4 space-y-3">
        <div className="w-full flex items-center gap-4">
          <p className="font-semibold text-sm">Status</p>
          <div className="flex-grow flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button
              type="button"
              variant={!statusFilter ? "primary" : "base"}
              outline
              onClick={() =>
                setFilter([
                  { field: "order_status", operator: "=", value: null },
                ])
              }
            >
              Semua
            </Button>
            {Object.keys(ORDER_STATUS_MAP).map((key) => (
              <Button
                key={key}
                type="button"
                variant={statusFilter?.value === key ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    { field: "order_status", operator: "=", value: key },
                  ])
                }
              >
                {ORDER_STATUS_MAP[key as keyof typeof ORDER_STATUS_MAP]}
              </Button>
            ))}
          </div>
        </div>

        {!orders || orders.length <= 0 ? (
          <p className="px-3 py-4 text-2xl lg:text-3xl text-center">
            Tidak ada data
          </p>
        ) : (
          <>
            {orders?.map((order) => {
              const isReviewed = !order.order_items.some(
                (item) => !item.review
              );
              return (
                <BaseCard key={order.id} className="space-y-3">
                  <div className="flex justify-between lg:justify-start items-center gap-1 lg:gap-2">
                    <div className="flex items-center gap-2">
                      <MdOutlineShoppingBag className="text-lg text-gray-500 dark:text-gray-400" />
                      <span className="text-xs">
                        {format(new Date(order.created_at), "dd MMM yyyy")}
                      </span>
                    </div>
                    <span
                      className={twMerge(
                        "font-medium text-xs px-2 py-1",
                        ORDER_STATUS_CLASS_MAP[order.order_status] ??
                          "text-emerald-500 bg-emerald-500/10"
                      )}
                    >
                      {ORDER_STATUS_MAP[order.order_status] ??
                        order.order_status}
                    </span>
                    <span className="hidden lg:inline text-xs text-gray-500 dark:text-gray-400">
                      {order.order_number}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <MdOutlineStore className="text-lg text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold text-sm">
                        {order.store.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:divide-x divide-gray-200 dark:divide-gray-700">
                      <div className="flex-grow flex items-start gap-3">
                        <div className="flex-shrink-0 relative h-16 aspect-square rounded overflow-hidden">
                          <Image
                            src={
                              order.order_items[0].product?.product_images?.find(
                                (image) => image.main_image
                              )?.image_url ||
                              order.order_items[0].product?.product_images?.[0]
                                ?.image_url ||
                              DEFAULT_STORE_CATEGORY_IMAGE
                            }
                            alt={order.order_items[0].product?.name ?? ""}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="25vw"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="my-0 leading-none line-clamp-1">
                            {order.order_items[0].product?.name ?? ""}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 my-0 leading-none">
                            {`${order.order_items[0].quantity} x ${
                              order.order_items[0].product_variant?.price
                                ? formatPrice(
                                    order.order_items[0].product_variant?.price
                                  )
                                : ""
                            }`}
                          </p>
                          {order.order_items.length - 1 > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 my-0 leading-none">
                              {`+ ${order.order_items.length - 1} produk lain`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="lg:w-1/4 lg:px-4 lg:py-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Belanja
                        </p>
                        <p className="font-semibold">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end lg:justify-between lg:pt-4">
                      <div className="hidden lg:block text-sm space-y-1">
                        {order.order_status === "PAID" &&
                          order.accept_deadline && (
                            <>
                              <p className="text-gray-500 dark:text-gray-400 leading-none">
                                Pesanan akan dikonfirmasi paling lama{" "}
                              </p>
                              <p className="text-gray-900 dark:text-white leading-none">
                                {format(
                                  new Date(order.accept_deadline),
                                  "dd-MM-yyyy"
                                )}
                              </p>
                            </>
                          )}
                        {order.order_status === "PROCESSED" &&
                          order.shipping_deadline && (
                            <>
                              <p className="text-gray-500 dark:text-gray-400 leading-none">
                                Pesanan akan dikirim paling lama{" "}
                              </p>
                              <span className="text-gray-900 dark:text-white leading-none">
                                {format(
                                  new Date(order.shipping_deadline),
                                  "dd-MM-yyyy"
                                )}
                              </span>
                            </>
                          )}
                        {order.order_status === "SHIPPED" &&
                          order.deliver_deadline && (
                            <>
                              <p className="text-gray-500 dark:text-gray-400 leading-none">
                                Pesanan akan sampai paling lama{" "}
                              </p>
                              <p className="text-gray-900 dark:text-white leading-none">
                                {format(
                                  new Date(order.deliver_deadline),
                                  "dd-MM-yyyy"
                                )}
                              </p>
                            </>
                          )}
                        {order.order_status === "DELIVERED" &&
                          order.recieve_deadline && (
                            <>
                              <p className="text-gray-500 dark:text-gray-400 leading-none">
                                Pesanan akan otomatis selesai pada{" "}
                              </p>
                              <span className="text-gray-900 dark:text-white leading-none">
                                {format(
                                  new Date(order.recieve_deadline),
                                  "dd-MM-yyyy"
                                )}
                              </span>
                            </>
                          )}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="base"
                          className="text-primary dark:text-primary"
                          onClick={() => {
                            setSelectedItem(order);
                            setIsModalDetailOpen(true);
                          }}
                        >
                          Detail Pesanan
                        </Button>
                        {order.order_status === "COMPLETED" && !isReviewed && (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            outline
                            onClick={() => {
                              setSelectedItem(order);
                              setIsModalReviewOpen(true);
                            }}
                          >
                            Beri Ulasan
                          </Button>
                        )}
                        {order.order_status === "DELIVERED" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              handleCompleteOrder(order.order_number)
                            }
                            disabled={isLoadingRequest}
                            isLoading={isLoadingRequest}
                          >
                            Pesanan Selesai
                          </Button>
                        )}
                        {order.order_status === "COMPLETED" && isReviewed && (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() => handleReorder(order)}
                          >
                            Beli Lagi
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </BaseCard>
              );
            })}

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => {
                  !!previousPage && previousPage();
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }}
                size="sm"
                variant="primary"
                outline
                disabled={!previousPage}
              >
                <MdChevronLeft className="text-xl" />
                <span>Sebelumnya</span>
              </Button>
              <span>{queryState.page}</span>
              <Button
                onClick={() => {
                  !!nextPage && nextPage();
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }}
                size="sm"
                variant="primary"
                outline
                disabled={!nextPage}
              >
                <span>Berikutnya</span>
                <MdChevronRight className="text-xl" />
              </Button>
            </div>
          </>
        )}
      </BaseCard>

      <DetailOrderModal
        key={`modal_detail_${selectedItem?.id}`}
        isOpen={isModalDetailOpen}
        onClose={() => {
          setIsModalDetailOpen(false);
          setSelectedItem(null);
        }}
        order={selectedItem}
      />

      <ReviewOrderModal
        key={`modal_review_${selectedItem?.id}`}
        isOpen={isModalReviewOpen}
        onClose={() => {
          setIsModalReviewOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleCreateReviews}
        order={selectedItem}
      />
    </>
  );
}

type DetailOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: MakePropertiesRequired<
    Order,
    "transaction" | "order_items" | "store"
  > | null;
};

function DetailOrderModal({ isOpen, onClose, order }: DetailOrderModalProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const [isTimelineExpand, setIsTimelineExpand] = useState(false);

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="px-0 w-full max-w-xl max-h-[80vh] overflow-hidden transition-all flex flex-col"
    >
      <div className="px-4 pb-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-medium leading-6">Detail Pesanan</h3>
        <MdClose className="text-xl cursor-pointer" onClick={onClose} />
      </div>
      {!!order ? (
        <div className="divide-y-8 divide-gray-200 dark:divide-gray-700 overflow-y-auto h-full">
          <div className="p-4 space-y-1 text-sm">
            <div className="pb-3 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-base">
                  {ORDER_STATUS_MAP[order.order_status]}
                </span>
                <div
                  onClick={() => setIsTimelineExpand((prev) => !prev)}
                  className="flex items-center gap-1 text-primary cursor-pointer"
                >
                  <span>Lihat Detail</span>
                  <MdKeyboardArrowDown
                    className={twMerge(
                      "text-lg",
                      isTimelineExpand ? "rotate-180" : ""
                    )}
                  />
                </div>
              </div>
              <BaseCard
                className={twMerge(
                  "grid grid-rows-[0fr] transition-all duration-500 overflow-hidden",
                  isTimelineExpand ? "p-3 lg:p-4 grid-rows-[1fr]" : "p-0"
                )}
              >
                <div className="overflow-hidden">
                  {timelines.map((timeline, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 lg:gap-4 text-xs"
                    >
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
                          <div className="h-5 w-0.5 bg-gray-500 dark:bg-gray-400" />
                        )}
                      </div>
                      <span className="w-1/2 font-medium">
                        {timeline.title}
                      </span>
                    </div>
                  ))}
                </div>
              </BaseCard>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Nomor Pesanan
              </span>
              <span className="text-primary">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Tanggal Pemesanan
              </span>
              <span>
                {format(new Date(order.created_at), "dd MMM yyy, HH:mm")}
              </span>
            </div>
          </div>

          <div className="p-4 text-sm space-y-3">
            <div className="flex flex-col lg:flex-row justify-between">
              <p className="font-medium text-base">Detail Produk</p>
              <Link
                href={`/${order.store.slug}`}
                className="flex items-center gap-1 hover:text-primary"
              >
                <MdOutlineStore className="text-lg text-gray-500 dark:text-gray-400" />
                <span className="font-medium">{order.store.name}</span>
                <MdChevronRight className="text-base" />
              </Link>
            </div>
            <div>
              {order.order_items.map((item) => (
                <BaseCard
                  key={item.id}
                  className="flex flex-col lg:flex-row lg:items-start gap-2"
                >
                  <div className="lg:flex-grow flex items-start gap-2">
                    <div className="flex-shrink-0 h-20 aspect-square bg-cover bg-center relative rounded overflow-hidden">
                      <Image
                        src={
                          item.product?.product_images?.find(
                            (image) => image.main_image
                          )?.image_url ||
                          item.product?.product_images?.[0]?.image_url ||
                          DEFAULT_STORE_CATEGORY_IMAGE
                        }
                        alt={item.product?.name ?? ""}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="leading-tight line-clamp-1 text-gray-600 dark:text-gray-300">
                        {item.product?.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.product_variant?.variant_options?.map((opt) => (
                          <span
                            key={opt.id}
                            className="font-medium text-xxs lg:text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600"
                          >
                            {opt.value}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {`${item.quantity} x ${formatPrice(
                          item.product_variant?.price ?? 0
                        )}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between lg:justify-start lg:flex-col items-center lg:items-end gap-1.5 text-sm lg:text-base">
                    <div className="flex flex-col items-start lg:items-end">
                      <span>Total Harga</span>
                      <span className="font-semibold">
                        {formatPrice(
                          (item.product_variant?.price ?? 0) * item.quantity
                        )}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      outline
                      onClick={() => {
                        const product = item.product;
                        const productVariant = item.product_variant;
                        if (!!product && !!productVariant) {
                          addItem({ product, productVariant, quantity: 1 });
                          router.push("/cart");
                        }
                      }}
                    >
                      Beli Lagi
                    </Button>
                  </div>
                </BaseCard>
              ))}
            </div>
          </div>

          <div className="p-4 text-sm space-y-3">
            <p className="font-medium text-base">Info Pengiriman</p>
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-[15%] text-gray-500 dark:text-gray-400">
                  Kurir
                </span>
                <span>:</span>
                <span className="flex-grow font-light uppercase">
                  {`${order.shipping_courier} - ${order.delivery_service}`}
                </span>
              </div>
              {order.shipping_tracking_number && (
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-[15%] text-gray-500 dark:text-gray-400">
                    No. Resi
                  </span>
                  <span>:</span>
                  <span className="flex-grow font-light">
                    {order.shipping_tracking_number}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-[15%] text-gray-500 dark:text-gray-400">
                  Alamat
                </span>
                <span>:</span>
                <div className="flex-grow font-light flex flex-col gap-1">
                  <span className="font-semibold">{order.reciever_name}</span>
                  <span>{order.reciever_phone}</span>
                  <span>{order.delivery_address}</span>
                  <span>
                    {`${order.delivery_city}, ${order.delivery_province}`}
                  </span>
                  <span>{order.delivery_postal_code}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 text-sm space-y-3">
            <p className="font-medium text-base">Rincian Pembayaran</p>
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Metode Pembayaran
                </span>
                <span className="font-light uppercase">
                  {order.transaction.payment_type?.replaceAll("_", " ")}
                </span>
              </div>
              {order.transaction.payment_code && (
                <div className="flex items-start justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Kode Pembayaran
                  </span>
                  <span className="font-light uppercase">
                    {order.transaction.payment_code}
                  </span>
                </div>
              )}

              <div className="w-full py-3" />

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
              <div className="flex items-start justify-between">
                <span className="text-base font-semibold">Total Pesanan</span>
                <span className="font-semibold text-base">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <p className="text-xl">No Data</p>
        </div>
      )}
      {/* {order?.order_status === "COMPLETED" && (
        <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
          <Button type="button" variant="primary">
            Beri Ulasan
          </Button>
        </div>
      )} */}
    </BaseModal>
  );
}

type ReviewOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: {
      rating: number;
      coment?: string;
      product_id: string;
      product_variant_id: string;
      order_item_id: string;
    }[]
  ) => Promise<void> | void;
  order: MakePropertiesRequired<
    Order,
    "transaction" | "order_items" | "store"
  > | null;
};

function ReviewOrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
}: ReviewOrderModalProps) {
  const [items, setItems] = useState<
    (OrderItem & { review_rating: number; review_comment?: string })[]
  >(
    order?.order_items
      ? order.order_items.map((item) => ({
          ...item,
          review_rating: 0,
          review_comment: undefined,
        }))
      : []
  );

  const [isLoading, setIsLoading] = useState(false);

  const isValidInput = !items.some(
    (item) => !item.review_rating || item.review_rating <= 0
  );

  const handleSubmit = async () => {
    if (!isValidInput) {
      toast.error("Tolong lengkapi data review");
      return;
    }

    setIsLoading(true);

    await onSubmit(
      items.map((item) => ({
        order_item_id: item.id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        rating: item.review_rating,
        coment: item.review_comment,
      }))
    );

    onClose();
    setIsLoading(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="px-0 w-full max-w-xl max-h-[80vh] overflow-hidden transition-all flex flex-col"
    >
      <div className="px-4 pb-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-medium leading-6">Beri Ulasan</h3>
        <MdClose className="text-xl cursor-pointer" onClick={onClose} />
      </div>
      {!!order ? (
        <div className="p-3 overflow-y-auto h-full space-y-3">
          {items.map((item) => (
            <BaseCard key={item.id} className="p-3 space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
                  <Image
                    src={
                      item.product?.product_images?.find(
                        (image) => image.main_image
                      )?.image_url ||
                      item.product?.product_images?.[0]?.image_url ||
                      DEFAULT_STORE_CATEGORY_IMAGE
                    }
                    alt={item.product?.name ?? ""}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>

                <div className="flex-grow space-y-1">
                  <p className="leading-none">{item.product?.name}</p>
                  <div className="flex items-center gap-2">
                    {item.product_variant?.variant_options?.map((opt) => (
                      <span
                        key={opt.id}
                        className="font-medium text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600"
                      >
                        {opt.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm leading-none">Rating Produk</span>
                <RatingInput
                  value={item.review_rating}
                  onChange={(val) =>
                    setItems((prev) =>
                      prev.map((itm) =>
                        itm.id === item.id
                          ? { ...itm, review_rating: val }
                          : itm
                      )
                    )
                  }
                />
              </div>

              <FormArea
                id={`comment_${item.id}`}
                className="text-sm px-2 py-1.5"
                placeholder="Tulis ulasan anda..."
                rows={3}
                value={item.review_comment}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((itm) =>
                      itm.id === item.id
                        ? { ...itm, review_comment: e.target.value }
                        : itm
                    )
                  )
                }
              />
            </BaseCard>
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <p className="text-xl">No Data</p>
        </div>
      )}
      <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
        <Button variant="base" outline onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Kirim Ulasan
        </Button>
      </div>
    </BaseModal>
  );
}

type RatingInputProps = {
  value?: number;
  onChange?: (val: number) => void;
  className?: string;
};
function RatingInput({ value, onChange, className }: RatingInputProps) {
  const [selected, setSelected] = useState<number | undefined>(value);

  return (
    <div
      className={twMerge("flex items-center", className)}
      onMouseLeave={() => setSelected(value)}
    >
      {new Array(5).fill(0).map((_, index) => (
        <span
          key={index}
          className="text-xl text-yellow-500 group leading-none cursor-pointer"
          onMouseEnter={() => setSelected(index + 1)}
          onMouseLeave={() => setSelected(value)}
          onClick={() => onChange && onChange(index + 1)}
        >
          {!!selected && index + 1 <= selected ? (
            <RiStarFill />
          ) : (
            <RiStarLine />
          )}
        </span>
      ))}
    </div>
  );
}
