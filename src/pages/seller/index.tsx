import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import {
  getStoreOrderStatusount,
  getStoreOrderSummay,
  getStoreRatingSummay,
  getStoreSales,
  getStoreSalesSummay,
  getStoreTopOrderCustomers,
  getStoreTopOrderProducts,
  getStoreTopOrderProvince,
} from "@/lib/api/dashboard";
import { formatPrice, formatPriceAcro } from "@/lib/formater";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Fragment, useState } from "react";
import {
  MdCheck,
  MdChevronRight,
  MdKeyboardArrowDown,
  MdOutlineAllInbox,
  MdOutlineArticle,
  MdOutlineLocalShipping,
  MdOutlineMoveToInbox,
  MdOutlinePayments,
  MdOutlineTimer,
  MdTrendingDown,
  MdTrendingFlat,
  MdTrendingUp,
} from "react-icons/md";
import { RiInformationLine, RiStarFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { getYear } from "date-fns/getYear";
import { getMonth } from "date-fns/getMonth";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Listbox, Transition } from "@headlessui/react";
import { getUserStore } from "@/lib/api/stores";
import Image from "next/image";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_USER_IMAGE,
} from "@/lib/constants";
import { IconType } from "react-icons";
import Link from "next/link";
import { ButtonLink } from "@/components/utils/Button";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const STATUS_MAP: { [key: string]: string } = {
  UNPAID: "Belum Dibayar",
  PAID: "Menunggu Konfirmasi",
  PROCESSED: "Diproses",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Telah Dikirim",
  // COMPLETED: "Selesai",
  // CANCELED: "Dibatalkan",
};
export const STATUS_ICON_MAP: { [key: string]: IconType } = {
  UNPAID: MdOutlinePayments,
  PAID: MdOutlineTimer,
  PROCESSED: MdOutlineAllInbox,
  SHIPPED: MdOutlineLocalShipping,
  DELIVERED: MdOutlineMoveToInbox,
  // COMPLETED: "Selesai",
  // CANCELED: "Dibatalkan",
};

const METHOD_MAP: { [key: string]: string } = {
  qris: "QRIS",
  bank_transfer: "Bank Transfer",
  gopay: "GoPay",
  echannel: "E-Money",
  cstore: "Cs Store",
};

const yearsOptions = [
  getYear(new Date()),
  getYear(new Date()) - 1,
  getYear(new Date()) - 2,
  getYear(new Date()) - 3,
];

export default function SellerDashboard() {
  const { data: session } = useSession();

  const currentUser = session?.user;
  const userId = currentUser?.id;
  const userToken = currentUser?.access_token;

  const { data: store, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () =>
      getUserStore<"products_count" | "orders_count">(userToken, {
        withCount: ["products", "orders"],
      }),
    enabled: !!userId && !!userToken,
  });

  const { data: summarySales } = useQuery({
    queryKey: ["/dashboard/store_sales_summary", userToken],
    queryFn: () => (userToken ? getStoreSalesSummay(userToken) : null),
    enabled: !!userToken,
  });
  const { data: summaryOrder } = useQuery({
    queryKey: ["/dashboard/store_order_summary", userToken],
    queryFn: () => (userToken ? getStoreOrderSummay(userToken) : null),
    enabled: !!userToken,
  });
  const { data: summaryRating } = useQuery({
    queryKey: ["/dashboard/store_rating_summary", userToken],
    queryFn: () => (userToken ? getStoreRatingSummay(userToken) : null),
    enabled: !!userToken,
  });
  const { data: statusOrders } = useQuery({
    queryKey: ["/dashboard/store_order_status_count", userToken],
    queryFn: () => (userToken ? getStoreOrderStatusount(userToken) : null),
    enabled: !!userToken,
  });

  if (isLoading) {
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

  const formattedStatusOrder = Object.keys(STATUS_MAP).map((key) => ({
    statusText: STATUS_MAP[key] ?? key,
    order_status: key,
    count: statusOrders?.find((stat) => stat.order_status === key)?.count ?? 0,
    Icon: STATUS_ICON_MAP[key] ?? MdOutlineArticle,
  }));

  return (
    <div className="space-y-2 lg:space-y-4 px-3 lg:px-5 pt-1 pb-6">
      <div className="space-y-2">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/seller",
            },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            {`Selamat datang, ${currentUser?.name}`}
          </h1>
          <p className="leading-none text-gray-500 dark:text-gray-400">
            {`Berikut rangkuman data dari ${store.name}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
        <BaseCard className="space-y-6">
          <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
            Pendapatan Bulan Ini
          </p>
          {summarySales && (
            <div className="space-y-4">
              <p className="leading-none text-3xl font-semibold">
                {formatPrice(summarySales.current_month)}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <span
                  className={twMerge(
                    "text-xl",
                    summarySales.difference < 0
                      ? "text-rose-500 dark:text-rose-500"
                      : "text-emerald-500 dark:text-emerald-500"
                  )}
                >
                  {summarySales.difference < 0 ? (
                    <MdTrendingDown />
                  ) : (
                    <MdTrendingUp />
                  )}
                </span>
                <span
                  className={twMerge(
                    summarySales.difference < 0
                      ? "text-rose-500 dark:text-rose-500"
                      : "text-emerald-500 dark:text-emerald-500"
                  )}
                >
                  {`${
                    summarySales.difference < 0 ? "-" : "+"
                  } ${summarySales.percentage_difference.toFixed(1)} %`}
                </span>
                <span>dari bulan lalu</span>
              </div>
            </div>
          )}
        </BaseCard>
        <BaseCard className="space-y-6">
          <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
            Pesanan Bulan Ini
          </p>
          {summaryOrder && (
            <div className="space-y-4">
              <p className="leading-none text-3xl font-semibold">
                {summaryOrder.current_month}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <span
                  className={twMerge(
                    "text-xl",
                    summaryOrder.difference < 0
                      ? "text-rose-500 dark:text-rose-500"
                      : "text-emerald-500 dark:text-emerald-500"
                  )}
                >
                  {summaryOrder.difference < 0 ? (
                    <MdTrendingDown />
                  ) : (
                    <MdTrendingUp />
                  )}
                </span>
                <span
                  className={twMerge(
                    summaryOrder.difference < 0
                      ? "text-rose-500 dark:text-rose-500"
                      : "text-emerald-500 dark:text-emerald-500"
                  )}
                >
                  {`${
                    summaryOrder.difference < 0 ? "-" : "+"
                  } ${summaryOrder.percentage_difference.toFixed(1)} %`}
                </span>
                <span>dari bulan lalu</span>
              </div>
            </div>
          )}
        </BaseCard>
        <BaseCard className="space-y-6">
          <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
            Rata - Rata Penilaian
          </p>
          {summaryRating && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RiStarFill className="text-yellow-500 text-2xl" />
                <p className="leading-none text-3xl font-semibold">
                  {summaryRating.current_month.toFixed(1)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <span
                  className={twMerge(
                    "text-xl text-sky-500 dark:text-sky-500",
                    summaryRating.difference < -0.1
                      ? "text-rose-500 dark:text-rose-500"
                      : "",
                    summaryRating.difference > 0.1
                      ? "text-emerald-500 dark:text-emerald-500"
                      : ""
                  )}
                >
                  {summaryRating.difference < -0.1 ? (
                    <MdTrendingDown />
                  ) : summaryRating.difference > 0.1 ? (
                    <MdTrendingUp />
                  ) : (
                    <MdTrendingFlat />
                  )}
                </span>
                <span
                  className={twMerge(
                    "text-sky-500 dark:text-sky-500",
                    summaryRating.difference < -0.1
                      ? "text-rose-500 dark:text-rose-500"
                      : "",
                    summaryRating.difference > 0.1
                      ? "text-emerald-500 dark:text-emerald-500"
                      : ""
                  )}
                >
                  {`${
                    summaryRating.difference < -0.1
                      ? "-"
                      : summaryRating.difference > 0.1
                      ? "+"
                      : ""
                  } ${Math.abs(summaryRating.difference).toFixed(1)}`}
                </span>
                <span>dari bulan lalu</span>
              </div>
            </div>
          )}
        </BaseCard>
      </div>

      <BaseCard className="space-y-4 lg:space-y-8 pb-4 lg:pb-8 bg-primary dark:bg-primary">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <p className="leading-none text-xl font-medium text-slate-50 dark:text-slate-800">
            Total Saldo Toko
          </p>
          <ButtonLink
            href="/seller/withdraws"
            className="hidden lg:flex"
            variant="base"
          >
            Withdraw Saldo
          </ButtonLink>
        </div>
        <p className="leading-none text-4xl lg:text-7xl tracking-wide font-semibold text-center text-slate-50 dark:text-slate-800">
          {formatPrice(store.total_balance)}
        </p>
        <ButtonLink
          href="/seller/withdraws"
          className="w-full lg:hidden"
          variant="base"
        >
          Withdraw Saldo
        </ButtonLink>
      </BaseCard>

      <BaseCard className="space-y-4 lg:space-y-8 pb-4 lg:pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <p className="leading-none text-xl font-medium">Ringkasan Pesanan</p>
          <Link
            href="/seller/orders"
            className="flex items-center text-sm text-primary hover:text-primary/80"
          >
            <span>Lihat Semua Pesanan</span>
            <MdChevronRight className="text-lg" />
          </Link>
        </div>
        <div className="flex items-start justify-between lg:px-4 gap-2">
          {formattedStatusOrder.map((item, index) => (
            <Link
              href={`/seller/orders?status=${item.order_status}`}
              key={index}
              className="w-full flex flex-col items-center gap-1.5 group"
            >
              <div className="relative h-8 lg:h-10 aspect-square flex items-center justify-center">
                {!!item.count && (
                  <span className="leading-none m-0 p-0 text-base font-medium text-white h-4 lg:h-6 aspect-square rounded-full flex items-center justify-center bg-primary absolute -right-2 -top-2">
                    {item.count}
                  </span>
                )}
                <item.Icon className="text-2xl lg:text-4xl text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
              </div>
              <span className="leading-none text-xxs lg:text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white text-center">
                {item.statusText}
              </span>
            </Link>
          ))}
        </div>
      </BaseCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesChart className="lg:col-span-2" />
        <TopProductsSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ProvinceChart className="lg:col-span-2" />
        <TopCustomersSection />
      </div>
    </div>
  );
}

function SalesChart({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const [selectedYears, setSelectedYears] = useState([getYear(new Date())]);

  const { data: sales } = useQuery({
    queryKey: ["/dashboard/store_sales", userToken, selectedYears],
    queryFn: () => (userToken ? getStoreSales(userToken, selectedYears) : null),
    enabled: !!userToken,
  });

  const formatedData = sales ? formatSalesChartData(sales) : undefined;

  return (
    <BaseCard className={twMerge("space-y-8", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="leading-none text-xl font-medium">
            Ringkasan Pendapatan
          </p>
          <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
            Data pendapatan tahunan toko
          </p>
        </div>

        <Listbox value={selectedYears} onChange={setSelectedYears} multiple>
          <div className="relative w-60">
            <Listbox.Button className="bg-inherit text-left text-sm text-gray-700 dark:text-gray-300 block w-full px-3 py-2 placeholder-gray-400 border border-gray-400 rounded dark:placeholder-gray-500 dark:border-gray-500 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-500 dark:disabled:bg-gray-800 cursor-pointer disabled:cursor-not-allowed">
              <span className="block truncate">{selectedYears.join(", ")}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <MdKeyboardArrowDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-100 rounded shadow-sm dark:border-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-200 z-20">
                {yearsOptions.map((year, yearIdx) => (
                  <Listbox.Option
                    key={yearIdx}
                    className={({ active }) =>
                      `relative cursor-default text-sm select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-primary/40 text-white"
                          : "text-gray-900 dark:text-white"
                      }`
                    }
                    value={year}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {year}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                            <MdCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      <div className="overflow-x-auto">
        {/* <ResponsiveContainer className="w-full" height={350}> */}
        {!!formatedData ? (
          <AreaChart
            data={formatedData}
            className="text-gray-200 dark:text-gray-700"
            height={350}
            width={700}
          >
            <defs>
              {selectedYears.map((year, index) => (
                <linearGradient
                  key={`color-area-${year}`}
                  id={`color-area-${year}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={`hsl(${(index + 4) * 45}, 70%, 55%)`}
                    stopOpacity={(0.4 / selectedYears.length) * (index + 1)}
                  />
                  <stop
                    offset="95%"
                    stopColor={`hsl(${(index + 4) * 45}, 70%, 55%)`}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              className="fill-gray-500 dark:fill-gray-400 text-sm"
              tick={{ fill: "current" }}
              tickFormatter={(value) => {
                return value.slice(0, 3);
              }}
              tickMargin={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatPriceAcro(value)}
              className="fill-gray-500 dark:fill-gray-400 text-sm"
              tick={{ fill: "current" }}
              width={60}
              type="number"
              tickCount={6}
              tickMargin={8}
              domain={["dataMin", "auto"]}
            />
            <CartesianGrid
              vertical={false}
              className="text-gray-300 dark:text-gray-600"
              stroke="currentColor"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active) {
                  return <div></div>;
                }

                return (
                  <BaseCard className="space-y-2">
                    <p className="text-xl font-semibold">{label}</p>
                    <div>
                      {payload?.map((p, index) => {
                        return (
                          <p key={index} className="flex items-center gap-3">
                            <span
                              className="block w-3 aspect-square rounded-full border-2"
                              style={{ borderColor: p.stroke }}
                            ></span>
                            <span className="flex-grow w-24">{p.dataKey}</span>
                            <span>
                              {formatPrice(p.value ? Number(p.value) : 0)}
                            </span>
                          </p>
                        );
                      })}
                    </div>
                  </BaseCard>
                );
              }}
              cursor={{ fill: "currentColor" }}
            />
            <Legend
              iconType="square"
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 16 }}
            />
            {selectedYears.map((year, index) => (
              <Area
                id={`chart_area_${year}`}
                key={year}
                type="monotone"
                dataKey={`${year}`}
                stroke={`hsl(${(index + 4) * 45}, 70%, 55%)`}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color-area-${year})`}
              />
            ))}
          </AreaChart>
        ) : (
          <div></div>
        )}
        {/* </ResponsiveContainer> */}
      </div>
    </BaseCard>
  );
}

function ProvinceChart({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: provinces } = useQuery({
    queryKey: ["/dashboard/store_order_top_province", userToken],
    queryFn: () => (userToken ? getStoreTopOrderProvince(userToken) : null),
    enabled: !!userToken,
  });

  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Daerah Pesanan</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Data jumlah pesanan setiap daerah
        </p>
      </div>

      <div className="overflow-x-auto">
        {/* <ResponsiveContainer className="w-full" height={350}> */}
        {provinces ? (
          <BarChart
            layout="vertical"
            data={provinces}
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
            className="text-gray-200 dark:text-gray-700"
            height={500}
            width={700}
          >
            <YAxis
              axisLine={false}
              tickLine={false}
              dataKey="delivery_province"
              className="fill-gray-500 dark:fill-gray-400 text-xs"
              tick={(props) => {
                const { x, y, stroke, payload } = props;
                const match = payload?.value?.match(/\(([^)]+)\)/);

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={6} textAnchor="end" fill="current">
                      {match ? match[1] : payload.value}
                    </text>
                  </g>
                );
              }}
              // height={105}
              tickMargin={10}
              interval={0}
              width={160}
              type="category"
            />
            <XAxis
              tickLine={false}
              axisLine={false}
              className="fill-gray-500 dark:fill-gray-400 text-xs"
              tick={{ fill: "current" }}
              type="number"
              tickCount={10}
              // tickMargin={8}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active) {
                  return <div></div>;
                }

                return (
                  <BaseCard className="space-y-2">
                    <p className="text-xl font-semibold">{label}</p>
                    <div>
                      {payload?.map((p, index) => {
                        return (
                          <p key={index} className="flex items-center gap-3">
                            <span
                              className="block w-3 aspect-square rounded-full border-2"
                              style={{ borderColor: p.color }}
                            ></span>
                            <span>{p.value ?? 0}</span>
                          </p>
                        );
                      })}
                    </div>
                  </BaseCard>
                );
              }}
              cursor={{ fill: "currentColor" }}
            />
            <Bar dataKey="count" fill="#14b8a6" radius={3} />
          </BarChart>
        ) : (
          <div></div>
        )}
        {/* </ResponsiveContainer> */}
      </div>
    </BaseCard>
  );
}

function TopProductsSection({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: products } = useQuery({
    queryKey: ["/dashboard/store_order_top_products", userToken],
    queryFn: () => (userToken ? getStoreTopOrderProducts(userToken) : null),
    enabled: !!userToken,
  });
  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Produk Teratas</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Produk dengan penjualan terbanyak
        </p>
      </div>

      <div className="space-y-6">
        {products?.map((product) => (
          <div key={product.id} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={
                  product?.product_images?.find((image) => image.main_image)
                    ?.image_url ||
                  product?.product_images?.[0]?.image_url ||
                  DEFAULT_STORE_CATEGORY_IMAGE
                }
                alt={product?.name ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex-grow space-y-2">
              <p className="leading-tight truncate">
                {product.name.length > 20
                  ? `${product.name.slice(0, 20)}...`
                  : product.name}
              </p>
              <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
                {`${product.order_count} pesanan`}
              </p>
            </div>
            <div className="font-semibold">
              {formatPriceAcro(product.total_orders)}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

function TopCustomersSection({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: customers } = useQuery({
    queryKey: ["/dashboard/store_order_top_customers", userToken],
    queryFn: () => (userToken ? getStoreTopOrderCustomers(userToken) : null),
    enabled: !!userToken,
  });
  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Pelanggan Teratas</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Pelanggan dengan pembelian terbanyak
        </p>
      </div>

      <div className="space-y-6">
        {customers?.map((customer, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={customer.user_image ?? DEFAULT_USER_IMAGE}
                alt={customer.user_name ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex-grow space-y-2">
              <p className="leading-tight truncate">
                {customer.user_name.length > 20
                  ? `${customer.user_name.slice(0, 20)}...`
                  : customer.user_name}
              </p>
              <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
                {`${customer.order_count} pesanan`}
              </p>
            </div>
            <div className="font-semibold">
              {formatPriceAcro(customer.total_orders)}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

function formatSalesChartData(
  data: {
    year: number;
    data: {
      period: number;
      total: number;
    }[];
  }[]
) {
  return MONTHS.reduce((acc, curr, index) => {
    const newData: { month: string; [key: string]: number | string | null } = {
      month: curr,
    };
    data.forEach((item) => {
      const selectedMonthData = item.data.find(
        (val) => val.period === index + 1
      );
      newData[`${item.year}`] = selectedMonthData?.total ?? 0;
    });
    return [...acc, newData];
  }, [] as { month: string; [key: string]: number | string | null }[]);
}
