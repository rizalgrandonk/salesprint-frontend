import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import Badge from "@/components/utils/Badge";
import BaseModal from "@/components/utils/BaseModal";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button, ButtonMenu } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import { getUserStore } from "@/lib/api/stores";
import { payWithdraw } from "@/lib/api/withdraws";
import { formatPrice } from "@/lib/formater";
import toast from "@/lib/toast";
import { Withdraw } from "@/types/Withdraw";
import { MakePropertiesRequired } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdFilePresent,
  MdFileUpload,
  MdRefresh,
  MdSend,
} from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
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
  } = useDataTable<MakePropertiesRequired<Withdraw, "orders_count" | "store">>(
    QueryKeys.PAGINATED_WITHDRAWS,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      with: ["store"],
      withCount: ["orders"],
    },
    {
      enabled: !!userToken,
      token: userToken,
      queryKey: [QueryKeys.PAGINATED_WITHDRAWS, userToken],
    }
  );

  const handlePayWithdraw = async (data: PayForm) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return false;
    }
    if (!selectedItem) {
      toast.error("Pilih withdraw terlebih dahulu");
      return false;
    }

    const formData = new FormData();

    formData.append("receipt", data.image);

    const result = await payWithdraw(selectedItem.id, formData, userToken);

    if (!result.success) {
      toast.error(result.message);
      return false;
    }

    toast.success("Berhasil Menyelesaikan Pembayaran Withdraw");
    setSelectedItem(null);
    refetch();

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
        Withdraws data not found
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
                href: "/admin",
              },
              {
                title: "Daftar Pesanan",
                href: "/admin/orders",
              },
            ]}
          />

          <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              Daftar Withdraw
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between lg:flex-wrap">
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
                className: "text-gray-500 dark:text-gray-400",
                render: (item) => item.orders_count,
              },
            },
            {
              id: "store",
              header: {
                render: "Toko",
              },
              cell: {
                className: "text-sm",
                render: (item) =>
                  item.store.name.length < 13
                    ? item.store.name
                    : item.store.name.slice(0, 10) + "...",
              },
            },
            {
              id: "bank_account_number",
              header: {
                render: "Rekening Penerima",
              },
              cell: {
                render: (item) => (
                  <div className="space-y-1 text-sm">
                    <p className="leading-none text-gray-500 dark:text-gray-400">
                      {item.bank_name}
                    </p>
                    <p className="leading-none">{item.bank_account_number}</p>
                  </div>
                ),
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
                    size="sm"
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
                        variant="primary"
                        outline
                      >
                        Selesaikan Pembayaran
                      </Button>
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

      {!!selectedItem && (
        <PayFormModal
          isOpen={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
          }}
          onSubmit={handlePayWithdraw}
          withdraw={selectedItem}
        />
      )}
    </>
  );
}

const paySchema = z.object({
  image:
    typeof window === "undefined"
      ? z.string()
      : z.instanceof(File, { message: "Gambar harus diisi" }),
});

type PayForm = z.infer<typeof paySchema>;

type PayFormModalProps = {
  isOpen: boolean;
  withdraw: Withdraw;
  onClose: () => void;
  onSubmit: (data: PayForm) => boolean | Promise<boolean>;
};

const defaultValue = {
  name: undefined,
  image: undefined,
};

function PayFormModal({
  isOpen,
  withdraw,
  onClose,
  onSubmit,
}: PayFormModalProps) {
  const [formData, setFormData] = useState<Partial<PayForm>>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const validation = paySchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const data = validation.data;

    const isSuccess = await onSubmit(data);

    if (isSuccess) {
      setFormData(defaultValue);
      onClose();
    }

    setIsLoading(false);
  };

  const imagePreviewUrl =
    formData.image instanceof File
      ? URL.createObjectURL(formData.image)
      : formData.image;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xl overflow-hidden transition-all"
    >
      <div className="pb-2">
        <h3 className="text-2xl font-medium leading-6">
          Selesaikan Pembayaran
        </h3>
      </div>
      <div className="py-4 space-y-4">
        <div className="space-y-1">
          <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
            Informasi Rekening Pembayaran
          </p>
          <p className="leading-none">{withdraw.bank_name}</p>
          <p className="leading-none">{withdraw.bank_account_number}</p>
          <p className="leading-none">{withdraw.bank_account_name}</p>
        </div>
        <div className="space-y-1">
          <span className="text-base">Upload bukti pembayaran</span>
          {imagePreviewUrl ? (
            <div className="w-full h-48 bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={imagePreviewUrl}
                alt="New Category"
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-all duration-200"
                sizes="(max-width: 768px) 25vw, 25vw"
              />
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 relative rounded overflow-hidden flex justify-center items-center gap-4 flex-col border border-gray-400 dark:border-gray-500 cursor-pointer text-gray-400 dark:text-gray-500"
            >
              <MdFilePresent className="text-6xl" />
              <span>Pilih File</span>
            </div>
          )}
          <p className="text-gray-400 text-xs">
            JPG, JPEG or PNG. Maksimal 1 MB
          </p>
          <div className="flex">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="primary"
              isLoading={isLoading}
            >
              <MdFileUpload className="text-base" />
              <span>Pilih File</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
        <Button onClick={handleSubmit} variant="primary">
          <MdSend className="text-base" />
          <span>Submit</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        name="file-image"
        id="file-image"
        hidden
        onChange={handleFileImageChange}
      />
    </BaseModal>
  );
}
