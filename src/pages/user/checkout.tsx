import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import FormArea from "@/components/utils/FormArea";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import Meta from "@/components/utils/Meta";
import Spinner from "@/components/utils/Spinner";
import QueryKeys from "@/constants/queryKeys";
import { CartItem, useCart } from "@/contexts/CartContext";
import { getCities, getCosts, getProvince } from "@/lib/api/logistic";
import {
  getTransactionToken,
  updateTransactionByToken,
} from "@/lib/api/orders";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice, queryStateToQueryString } from "@/lib/formater";
import { Store } from "@/types/Store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";
import { SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import { MdOutlineDelete } from "react-icons/md";
import { object, z } from "zod";

export const addressSchema = z.object({
  reciever_name: z
    .string({ required_error: "Nama harus diisi" })
    .trim()
    .min(1, "Nama harus diisi")
    .max(50, "Nama tidak boleh lebih dari 50 karakter"),
  reciever_phone: z
    .string({ required_error: "Nomor telepon harus diisi" })
    .trim()
    .min(1, "Nomor telepon harus diisi")
    .max(20, "Nomor telepon tidak boleh lebih dari 20 karakter"),
  delivery_address: z
    .string({ required_error: "Alamat harus diisi" })
    .trim()
    .min(1, "Alamat harus diisi")
    .max(100, "Alamat tidak boleh lebih dari 100 karakter"),
  delivery_city_id: z
    .string({ required_error: "Kota harus diisi" })
    .trim()
    .min(1, "Kota harus diisi")
    .max(10, "Kota tidak boleh lebih dari 10 karakter"),
  delivery_city: z
    .string({ required_error: "Kota harus diisi" })
    .trim()
    .min(1, "Kota harus diisi")
    .max(150, "Kota tidak boleh lebih dari 50 karakter"),
  delivery_province_id: z
    .string({ required_error: "Provinsi harus diisi" })
    .trim()
    .min(1, "Provinsi harus diisi")
    .max(10, "Provinsi tidak boleh lebih dari 10 karakter"),
  delivery_province: z
    .string({ required_error: "Provinsi harus diisi" })
    .trim()
    .min(1, "Provinsi harus diisi")
    .max(50, "Provinsi tidak boleh lebih dari 50 karakter"),
  delivery_postal_code: z
    .string({ required_error: "Kode pos harus diisi" })
    .trim()
    .min(1, "Kode pos harus diisi")
    .max(10, "Kode pos tidak boleh lebih dari 10 karakter"),
});

type AddressInput = z.infer<typeof addressSchema>;

type DeliveryData = {
  courier: string;
  service: string;
  cost: number;
  etd: string;
};

export default function CheckoutPage() {
  const { cartTotal, totalItems, items, emptyCart } = useCart();
  const { data: session } = useSession();

  const router = useRouter();

  const userToken = session?.user?.access_token;

  const formResult = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    mode: "all",
  });

  const {
    watch,
    handleSubmit,
    formState: { isValid: isFormValid },
  } = formResult;

  const { delivery_city_id: selectedCityId } = watch();

  const [itemGroups, setItemGroups] = useState(groupItemByStore(items));

  const [isLoadingRequest, setIsLoadingRequest] = useState(false);

  const [snapToken, setSnapToken] = useState<string | undefined>(undefined);

  const updateDeliveryData = (storeId: string, deliveryData: DeliveryData) => {
    return setItemGroups((prev) => {
      return prev.map((group) => {
        if (group.store.id === storeId) {
          return {
            ...group,
            delivery: deliveryData,
          };
        }
        return group;
      });
    });
  };

  useEffect(() => {
    router.prefetch("/user/orders");
  }, [router]);

  useEffect(() => {
    setItemGroups((prev) =>
      prev.map((group) => ({ ...group, delivery: null }))
    );
  }, [selectedCityId]);

  const isValidCheck =
    isFormValid &&
    !itemGroups.some((group) => !group.delivery || group.delivery.cost <= 0) &&
    totalItems > 0;

  const totalShippingCost = itemGroups.reduce(
    (acc, curr) => acc + (curr.delivery?.cost ?? 0),
    0
  );

  const handleSuccessResult = async (
    result: TransactionSuccessResult,
    snapToken: string
  ) => {
    if (!userToken) {
      console.log("User Token Not Found");
      return;
    }
    await updateTransactionByToken(userToken, snapToken, {
      transaction_id: result.transaction_id,
      status_code: result.status_code,
      status_message: result.status_message,
      payment_status: result.transaction_status,
      payment_type: result.payment_type,
      payment_code:
        result.payment_type === "bank_transfer"
          ? result.va_numbers[0]?.va_number ?? undefined
          : undefined,
      pdf_url:
        result.payment_type === "bank_transfer" ||
        result.payment_type === "cstore" ||
        result.payment_type === "echannel"
          ? result.pdf_url
          : undefined,
    });

    emptyCart();
    router.push("/user/orders");
  };
  const handleErrorResult = async (
    result: TransactionErrorResult,
    snapToken: string
  ) => {
    if (!userToken) {
      console.log("User Token Not Found");
      return;
    }
    await updateTransactionByToken(userToken, snapToken, {
      status_code: result.status_code,
      status_message: result.status_message[0] ?? "Error Payment",
      payment_status: "error",
    });

    emptyCart();
    router.push("/user/orders");
  };

  const onSubmit: SubmitHandler<AddressInput> = async (data) => {
    setIsLoadingRequest(true);
    await submitHandler(data);
    setIsLoadingRequest(false);
  };

  const submitHandler = async (data: AddressInput) => {
    console.log(data);

    if (!userToken) {
      console.log("User Token Not Found");
      return;
    }

    if (!isValidCheck) {
      console.log("Data Invalid");
      return;
    }

    let tokenSnap = snapToken;

    if (!tokenSnap) {
      const tokenResult = await getTransactionToken(userToken, {
        orders: itemGroups.map((group) => ({
          store_id: group.store.id,
          shipping: {
            delivery_cost: group.delivery!.cost,
            delivery_service: group.delivery!.service,
            shipping_courier: group.delivery!.courier,
          },
          items: group.items.map((item) => ({
            id: item.product.id,
            product_variant_id: item.productVariant.id,
            quantity: item.quantity,
          })),
        })),
        shipping_detail: data,
      });

      if (!tokenResult.success) {
        console.log(tokenResult.errors);
        console.log(tokenResult.message);
        return;
      }

      tokenSnap = tokenResult.data.token;
    }

    if (!tokenSnap) {
      console.log("Snap token not found");
      return;
    }

    window.snap.pay(tokenSnap, {
      onSuccess: async (result) => {
        if (!tokenSnap) {
          console.log("Snap token not found");
          setSnapToken(tokenSnap);
          return;
        }
        await handleSuccessResult(result, tokenSnap);
        setSnapToken(undefined);
      },
      onPending: async (result) => {
        if (!tokenSnap) {
          console.log("Snap token not found");
          setSnapToken(tokenSnap);
          return;
        }
        await handleSuccessResult(result, tokenSnap);
        setSnapToken(undefined);
      },
      onError: async (result) => {
        if (!tokenSnap) {
          console.log("Snap token not found");
          setSnapToken(tokenSnap);
          return;
        }
        await handleErrorResult(result, tokenSnap);
        setSnapToken(undefined);
      },
      onClose: () => {
        console.log(
          "customer close the popup window without the finishing the payment"
        );
        setSnapToken(tokenSnap);
        return;
      },
    });
  };

  return (
    <>
      <Meta title="Checkout | Salesprint" />
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <div className="py-8 container space-y-16 relative h-full">
        <section className="space-y-6">
          <h3 className="font-semibold text-2xl">Pengiriman</h3>
          <form
            className="flex gap-6 items-start"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex-grow space-y-4">
              <BaseCard className="space-y-3">
                <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Alamat Pengiriman
                </p>

                <AddressForm formResult={formResult} />
              </BaseCard>

              {itemGroups.map((group) => (
                <StoreCard
                  key={group.store.id}
                  group={group}
                  updateDeliveryData={updateDeliveryData}
                  selectedCityId={selectedCityId}
                />
              ))}
            </div>
            <BaseCard className="flex-shrink-0 w-96 sticky top-28 space-y-4">
              <p className="font-semibold text-xl">Ringkasan Belanja</p>
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>{`Total Harga (${totalItems} Barang)`}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {totalShippingCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span>{`Total Ongkos Kirim`}</span>
                    <span>{formatPrice(totalShippingCost)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Total Belanja</span>
                <span className="font-semibold text-lg">
                  {formatPrice(cartTotal + totalShippingCost)}
                </span>
              </div>
              <Button
                variant="primary"
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isValidCheck || isLoadingRequest}
                isLoading={isLoadingRequest}
              >
                Bayar
              </Button>
            </BaseCard>
          </form>
        </section>
      </div>
    </>
  );
}

type StoreCardProps = {
  group: {
    store: Store;
    items: CartItem[];
    delivery: DeliveryData | null;
  };
  updateDeliveryData: (storeId: string, deliveryData: DeliveryData) => void;
  selectedCityId?: string;
};
function StoreCard({
  group,
  selectedCityId,
  updateDeliveryData,
}: StoreCardProps) {
  const totalWeight = group.items.reduce(
    (acc, curr) => acc + curr.product.weight * curr.quantity,
    0
  );

  const costData = {
    origin: group.store.city_id,
    destination: selectedCityId,
    weight: totalWeight,
  };

  const { data: costResult } = useQuery({
    queryKey: [QueryKeys.STORE_GET_CITES, costData],
    queryFn: () =>
      selectedCityId
        ? getCosts({
            origin: group.store.city_id,
            destination: selectedCityId,
            weight: totalWeight,
          })
        : null,
    enabled: !!selectedCityId,
  });

  return (
    <BaseCard className="space-y-4">
      <p className="font-semibold">{group.store.name}</p>
      <div className="space-y-4">
        {group.items.map((item) => (
          <CartItemCard key={item.productVariant.id} item={item} />
        ))}
      </div>
      <FormSelect
        id="delivery_service"
        placeholder="Pilih Pengiriman"
        classNameContainer="w-full"
        className="w-full"
        options={costResult?.costs.map((opt) => ({
          title: `${costResult.code.toUpperCase()} ${opt.service} (${
            opt.cost[0].etd
          } Hari) - ${formatPrice(opt.cost[0].value)}`,
          value: opt.service,
        }))}
        value={group.delivery?.service}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            return;
          }
          if (!costResult) {
            return;
          }
          const selectedService = costResult.costs.find(
            (opt) => opt.service === value
          );
          if (!selectedService) {
            return;
          }

          updateDeliveryData(group.store.id, {
            cost: selectedService.cost[0].value,
            etd: selectedService.cost[0].etd,
            service: selectedService.service,
            courier: costResult?.code,
          });
        }}
      />
    </BaseCard>
  );
}

function AddressForm({
  formResult,
}: {
  formResult: UseFormReturn<AddressInput>;
}) {
  const { register, watch, setValue } = formResult;

  const {
    delivery_province_id: currentProvinceId,
    delivery_city_id: currentCityId,
  } = watch();

  const { data: provinceList } = useQuery({
    queryKey: [QueryKeys.STORE_GET_PROVINCE],
    queryFn: () => getProvince(),
  });

  const { data: cityList, isLoading: loadingCities } = useQuery({
    queryKey: [QueryKeys.STORE_GET_CITES, currentProvinceId],
    queryFn: () => getCities(currentProvinceId),
    enabled: !!currentProvinceId,
  });

  useEffect(() => {
    if (!currentProvinceId) {
      return;
    }

    const province = provinceList?.find(
      (item) => item.province_id === currentProvinceId
    );
    if (!province) {
      return;
    }

    setValue("delivery_province", province.province);
  }, [currentProvinceId, setValue, provinceList]);

  useEffect(() => {
    if (!currentCityId) {
      return;
    }

    const city = cityList?.find((item) => item.city_id === currentCityId);
    if (!city) {
      return;
    }

    setValue("delivery_city", city.city_name);
    setValue("delivery_postal_code", city.postal_code);
  }, [currentCityId, setValue, cityList]);

  const provinceOptions = (provinceList || []).map((item) => ({
    title: item.province,
    value: item.province_id,
  }));
  const cityOptions = (cityList || []).map((item) => ({
    title: `${item.type} ${item.city_name}`,
    value: item.city_id,
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <FormInput
          {...register("reciever_name")}
          type="text"
          id="reciever_name"
          label="Nama Penerima"
          classNameContainer="w-full"
          className="text-sm w-full px-2 py-1.5"
          classNameLabel="text-sm"
          classNameError="text-xs"
        />
        <FormInput
          {...register("reciever_phone")}
          type="text"
          id="reciever_phone"
          label="Nomor Telepon Penerima"
          classNameContainer="w-full"
          className="text-sm w-full px-2 py-1.5"
          classNameLabel="text-sm"
          classNameError="text-xs"
          elementLeft={<span className="text-sm">+62</span>}
        />
      </div>
      <div className="flex items-center gap-4">
        <FormSelect
          {...register("delivery_province_id")}
          id="delivery_province_id"
          label="Provinsi"
          classNameContainer="w-full"
          className="text-sm w-full px-2 py-1.5"
          classNameLabel="text-sm"
          classNameError="text-xs"
          placeholder="Pilih provinsi"
          options={provinceOptions}
        />
        <FormSelect
          {...register("delivery_city_id")}
          id="delivery_city_id"
          label="Kota / Kab"
          classNameContainer="w-full"
          className="text-sm w-full px-2 py-1.5"
          classNameLabel="text-sm"
          classNameError="text-xs"
          disabled={loadingCities}
          placeholder={loadingCities ? "Loading..." : "Pilih kota"}
          options={cityOptions}
        />
        <FormInput
          {...register("delivery_postal_code")}
          type="text"
          id="delivery_postal_code"
          label="Kode Pos"
          classNameContainer="w-full"
          className="text-sm w-full px-2 py-1.5"
          classNameLabel="text-sm"
          classNameError="text-xs"
        />
      </div>
      <FormArea
        {...register("delivery_address")}
        id="delivery_address"
        label="Alamat"
        classNameContainer="w-full"
        className="text-sm w-full px-2 py-1.5"
        classNameLabel="text-sm"
        classNameError="text-xs"
        rows={4}
      />
    </div>
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 h-20 aspect-square bg-cover bg-center relative rounded overflow-hidden">
        <Image
          src={
            item.product.product_images?.find((image) => image.main_image)
              ?.image_url ||
            item.product.product_images?.[0]?.image_url ||
            DEFAULT_STORE_CATEGORY_IMAGE
          }
          alt={item.product.name}
          fill
          loading="lazy"
          className="object-cover"
          sizes="25vw"
        />
      </div>

      <div className="flex-grow space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p>{item.product.name}</p>
            <div className="flex items-center gap-2">
              {item.productVariant.variant_options?.map((opt) => (
                <span
                  key={opt.id}
                  className="font-medium text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600"
                >
                  {opt.value}
                </span>
              ))}
            </div>
          </div>
          <div className="flex self-stretch flex-col justify-between items-end">
            <span className="font-semibold">
              {`${item.quantity} x ${formatPrice(item.productVariant.price)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function groupItemByStore(items: CartItem[]) {
  let result: {
    store: Store;
    items: CartItem[];
    delivery: DeliveryData | null;
  }[] = [];
  items.forEach((item) => {
    const itemStore = item.product.store;
    if (!itemStore) {
      return;
    }

    if (result.some((res) => res.store.id === itemStore.id)) {
      result = result.map((res) => {
        if (res.store.id === itemStore.id) {
          return {
            ...res,
            items: [...res.items, item],
          };
        }
        return res;
      });
      return;
    }

    result = [
      ...result,
      {
        store: itemStore,
        items: [item],
        delivery: null,
      },
    ];
    return;
  });

  return result;
}
