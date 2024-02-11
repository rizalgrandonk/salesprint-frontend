import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import Meta from "@/components/utils/Meta";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_USER_IMAGE,
} from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import { Order, Transaction } from "@/types/Order";
import { MakePropertiesRequired } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  MdChevronLeft,
  MdChevronRight,
  MdOutlineShoppingBag,
  MdOutlineStore,
} from "react-icons/md";

export default function OrderPage() {
  const { data: session } = useSession();

  const userData = session?.user;

  return (
    <>
      <Meta title="Pesanan | Salesprint" />
      <div className="py-8 container flex gap-6 items-start">
        <BaseCard className="p-0 flex-shrink-0 w-80 sticky top-28 divide-y divide-gray-200 dark:divide-gray-700">
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
          </ul>
        </BaseCard>

        <div className="flex-grow space-y-4 overflow-x-hidden">
          <h1 className="font-semibold text-2xl">Daftar Transaksi</h1>
          <TransactionSection />
        </div>
      </div>
    </>
  );
}

function TransactionSection() {
  const { data: session } = useSession();

  const userData = session?.user;
  const userId = userData?.id;
  const userToken = userData?.access_token;

  const {
    data: orders,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setFilter,
    refetch,
    isFetching,
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
        "order_items.product_variant",
        "order_items.product.product_images",
      ],
    },
    {
      enabled: !!userToken,
      token: userToken,
      queryKey: [QueryKeys.PAGINATED_USER_TRANSACTIONS, userToken],
    }
  );

  return (
    <BaseCard className="w-full p-4 space-y-3">
      <div className="w-full flex items-center gap-4">
        <p className="font-semibold text-sm">Status</p>
        <div className="flex-grow flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
          <Button type="button" variant={"base"} outline>
            Semua
          </Button>
        </div>
      </div>
      {orders?.map((order) => (
        <BaseCard key={order.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <MdOutlineShoppingBag className="text-lg text-gray-500 dark:text-gray-400" />
            <span className="text-xs">
              {format(new Date(order.created_at), "dd MMM yyyy")}
            </span>
            <span className="text-emerald-500 font-medium text-xs px-2 py-1 bg-emerald-500/10">
              {order.order_status}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {order.transaction.serial_order}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <MdOutlineStore className="text-lg text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-sm">{order.store.name}</span>
            </div>
            <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700">
              <div className="flex-grow flex items-start gap-3">
                <div className="relative h-16 aspect-square rounded overflow-hidden">
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
                  <p className="my-0 leading-none">
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
              <div className="w-1/4 px-4 py-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Belanja
                </p>
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button size="sm" variant="primary" outline>
                Detail Pesanan
              </Button>
              <Button size="sm" variant="primary">
                Beli Lagi
              </Button>
            </div>
          </div>
        </BaseCard>
      ))}

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
    </BaseCard>
  );
}
