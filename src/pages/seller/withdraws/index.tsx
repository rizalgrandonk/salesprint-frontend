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
import { getUserStore } from "@/lib/api/stores";
import { createStoreWithdraw } from "@/lib/api/withdraws";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import toast from "@/lib/toast";
import { ORDER_STATUS_MAP, Order } from "@/types/Order";
import { Withdraw } from "@/types/Withdraw";
import { MakePropertiesRequired } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
import { z } from "zod";

const WITHDRAW_STATUS_MAP = {
  PAID: "Terbayar",
  PENDING: "Sedang Diproses",
  DENIED: "Ditolak",
};
const WITHDRAW_STATUS_COLOR_MAP = {
  PAID: "success",
  PENDING: "warning",
  DENIED: "danger",
} as const;

const limitOptions = [10, 20, 30, 50, 100].map((limit) => ({
  title: limit.toString(),
  value: limit.toString(),
}));

const sortOptions = [
  {
    title: "Withdraw Terbaru",
    value: "created_at|desc",
  },
  {
    title: "Withdraw Terlama",
    value: "created_at|asc",
  },
];

export default function WithdrawsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const [selectedItem, setSelectedItem] = useState<MakePropertiesRequired<
    Withdraw,
    "orders_count"
  > | null>(null);

  const {
    data: withdraws,
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
  } = useDataTable<MakePropertiesRequired<Withdraw, "orders_count">>(
    QueryKeys.PAGINATED_STORE_WITHDRAWS,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      // with: [],
      withCount: ["orders"],
    },
    {
      enabled: !!userToken,
      token: userToken,
      queryKey: [QueryKeys.PAGINATED_STORE_WITHDRAWS, userToken],
    }
  );

  const { data: store, refetch: refetchStore } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateWithdraw = async (data: WithdrawForm) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return false;
    }

    const result = await createStoreWithdraw(data, userToken);

    if (!result.success) {
      toast.error(result.message);
      return false;
    }

    toast.success("Berhasil Membuat Permintaan Withdraw");
    setIsCreateModalOpen(false);
    refetch();
    refetchStore();

    return true;
  };

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!withdraws) {
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
        <div className="col-span-full space-y-2 px-3 lg:px-5 py-1">
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

          <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              Daftar Withdraw
            </h1>

            <div className="">
              <h2 className="text-sm">Saldo saat ini</h2>
              <p className="font-semibold text-lg">
                {formatPrice(store?.total_balance || 0)}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between lg:flex-wrap">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Withdraw Saldo
            </Button>

            <div className="flex gap-2 items-center lg:justify-between">
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
                    field: field as keyof Withdraw,
                    value: value as "asc" | "desc",
                  });
                }}
              />
            </div>
          </div>
        </div>

        <DataTable
          isFetching={isFetching || isLoading}
          list={withdraws}
          columns={[
            {
              id: "total_amount",
              header: {
                render: "Total",
              },
              cell: {
                render: (item) => formatPrice(item.total_amount || 0),
              },
            },
            {
              id: "orders_count",
              header: {
                render: "Jumlah Pesanan",
              },
              cell: {
                render: (item) => item.orders_count,
              },
            },
            {
              id: "created_at",
              header: {
                render: "Tanggal Withdraw",
              },
              cell: {
                className: "text-gray-500 dark:text-gray-400",
                render: (item) =>
                  format(new Date(item.created_at), "dd MMM yyyy HH:mm"),
              },
            },
            {
              id: "status",
              header: {
                render: "Status",
              },
              cell: {
                render: (item) => (
                  <Badge
                    className="rounded-full"
                    variant={WITHDRAW_STATUS_COLOR_MAP[item.status]}
                  >
                    {WITHDRAW_STATUS_MAP[item.status]}
                  </Badge>
                ),
              },
            },
            {
              id: "receipt",
              header: {
                render: "Bukti Pembayaran",
              },
              cell: {
                className: "whitespace-normal",
                render: (item) => (
                  <div className="h-10 lg:h-14 aspect-square relative rounded-sm overflow-hidden">
                    {item.receipt && (
                      <Image
                        src={item.receipt}
                        alt={item.id || ""}
                        fill
                        sizes="8rem"
                        loading="lazy"
                        className="object-cover"
                      />
                    )}
                  </div>
                ),
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
                        onClick={() => {
                          setSelectedItem(item);
                        }}
                        size="sm"
                        variant="info"
                        outline
                      >
                        Detail
                      </Button>
                    </div>
                  );
                },
              },
            },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center px-3 lg:px-5 py-1 gap-2">
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

      <CreateWithdrawModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        onSubmit={handleCreateWithdraw}
      />
    </>
  );
}

const withdrawSchema = z.object({
  bank_name: z
    .string({ required_error: "Nama Bank harus diisi" })
    .min(1, "Nama Bank harus diisi"),
  bank_account_number: z
    .string({ required_error: "Nomor Rekening harus diisi" })
    .min(1, "Nomor Rekening harus diisi"),
  bank_account_name: z
    .string({ required_error: "Atas Nama harus diisi" })
    .min(1, "Atas Nama harus diisi"),
});

type WithdrawForm = z.infer<typeof withdrawSchema>;

type CreateWithdrawModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WithdrawForm) => boolean | Promise<boolean>;
};

function CreateWithdrawModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateWithdrawModalProps) {
  const [formData, setFormData] = useState<Partial<WithdrawForm>>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    const validation = withdrawSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.message);
      setIsLoading(false);
      return;
    }

    const data = validation.data;

    const isSuccess = await onSubmit(data);

    if (isSuccess) {
      setFormData({});
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">
          Informasi Transfer Withdraw Saldo
        </h3>
      </div>
      <div className="py-4 space-y-4">
        <FormInput
          id="bank_name"
          label="Nama Bank"
          placeholder="Masukan nama bank"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, bank_name: e.target.value }))
          }
          value={formData.bank_name}
        />
        <FormInput
          id="bank_account_number"
          label="Nomor Rekening"
          placeholder="Masukan nomor rekening"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              bank_account_number: e.target.value,
            }))
          }
          value={formData.bank_account_number}
        />
        <FormInput
          id="bank_account_name"
          label="Atas Nama"
          placeholder="Masukan rekening atas nama"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              bank_account_name: e.target.value,
            }))
          }
          value={formData.bank_account_name}
        />
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
        <Button onClick={handleSubmit} variant="primary" isLoading={isLoading}>
          <span>Submit</span>
        </Button>
      </div>
    </BaseModal>
  );
}
