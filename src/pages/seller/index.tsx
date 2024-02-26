import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import {
  getStoreOrderSummay,
  getStoreRatingSummay,
  getStoreSales,
  getStoreSalesSummay,
  getStoreTopOrderMethods,
} from "@/lib/api/dashboard";
import { formatPrice } from "@/lib/formater";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { Fragment, useState } from "react";
import {
  MdArrowDownward,
  MdCheck,
  MdKeyboardArrowDown,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import { RiInformationLine, RiStarFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { getYear } from "date-fns/getYear";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Listbox, Transition } from "@headlessui/react";
import { getUserStore } from "@/lib/api/stores";

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

export default function Dashboard() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

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

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
                    "text-xl",
                    summaryRating.difference < 0
                      ? "text-rose-500 dark:text-rose-500"
                      : "text-emerald-500 dark:text-emerald-500"
                  )}
                >
                  {summaryRating.difference < 0 ? (
                    <MdTrendingDown />
                  ) : (
                    <MdTrendingUp />
                  )}
                </span>
                <span
                  className={twMerge(
                    summaryRating.difference < 0
                      ? "text-rose-500 dark:text-rose-500"
                      : "text-emerald-500 dark:text-emerald-500"
                  )}
                >
                  {`${
                    summaryRating.difference < 0 ? "-" : "+"
                  } ${summaryRating.difference.toFixed(1)}`}
                </span>
                <span>dari bulan lalu</span>
              </div>
            </div>
          )}
        </BaseCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SalesChart className="col-span-2" />
        <MethodChart />
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
    <BaseCard className={twMerge("space-y-10", className)}>
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
          <div className="relative w-80">
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

      <div>
        <ResponsiveContainer className="w-full min-h-[20rem]">
          <AreaChart data={formatedData}>
            <defs>
              {selectedYears.map((year, index) => (
                <linearGradient
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
              tickFormatter={(value) => {
                if (value > 999999) {
                  return `Rp ${(Math.abs(value) / 1000000).toFixed(0)}jt`;
                }
                if (value > 999) {
                  return `Rp ${(Math.abs(value) / 1000).toFixed(0)}rb`;
                }
                return `Rp ${Math.abs(value)}`;
              }}
              className="fill-gray-500 dark:fill-gray-400 text-sm"
              tick={{ fill: "current" }}
              width={80}
              type="number"
              tickCount={6}
              tickMargin={12}
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
                      {payload?.map((p) => {
                        return (
                          <p className="flex items-center gap-3">
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
            />
            <Legend
              iconType="square"
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 16 }}
            />
            {selectedYears.map((year, index) => (
              // <Line
              //   dot={false}
              //   type="monotone"
              //   dataKey={`${year}`}
              //   stroke={`hsl(${(index + 4) * 45}, 70%, 55%)`}
              //   strokeWidth={3}
              // />
              <Area
                type="monotone"
                dataKey={`${year}`}
                stroke={`hsl(${(index + 4) * 45}, 70%, 55%)`}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color-area-${year})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BaseCard>
  );
}

function MethodChart({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: methods } = useQuery({
    queryKey: ["/dashboard/store_order_top_methods", userToken],
    queryFn: () => (userToken ? getStoreTopOrderMethods(userToken) : null),
    enabled: !!userToken,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const formattedChartData = methods?.map((item) => ({
    payment_type: METHOD_MAP[item.payment_type] ?? item.payment_type,
    count: item.count,
  }));

  return (
    <BaseCard className={twMerge("space-y-10 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Metode Pembayaran</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Metode pembayaran yang sering dipakai
        </p>
      </div>

      <ResponsiveContainer className="aspect-square" height={300}>
        <PieChart className="w-full aspect-square">
          <Pie
            data={formattedChartData ?? undefined}
            dataKey="count"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            fill="#82ca9d"
            onMouseEnter={(data, index) => setActiveIndex(index)}
            activeIndex={activeIndex}
            activeShape={(props: any) => {
              const {
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                payload,
                percent,
                value,
              } = props;

              return (
                <g>
                  <text
                    x={cx}
                    y={cy}
                    dy={10}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={24}
                    fontWeight={600}
                  >
                    {value}
                  </text>
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                  />
                  <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                  />
                </g>
              );
            }}
          >
            {formattedChartData?.map((method, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${(index + 4) * 45}, 70%, 55%)`}
                strokeWidth={4}
                className="stroke-white dark:stroke-gray-800"
              />
            ))}
          </Pie>

          <Legend
            iconType="square"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value, entry, index) => {
              console.log(value, entry, index);
              return formattedChartData?.[value]?.payment_type ?? value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
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
    const newData: { month: string; [key: string]: number | string } = {
      month: curr,
    };
    data.forEach((item) => {
      newData[`${item.year}`] =
        item.data.find((val) => val.period === index + 1)?.total ?? 0;
    });
    return [...acc, newData];
  }, [] as { month: string; [key: string]: number | string }[]);
}
