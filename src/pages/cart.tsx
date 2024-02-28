import ProductCard from "@/components/ProductCard";
import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import Meta from "@/components/utils/Meta";
import Spinner from "@/components/utils/Spinner";
import QueryKeys from "@/constants/queryKeys";
import { CartItem, useCart } from "@/contexts/CartContext";
import { getPaginatedData } from "@/lib/api/data";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice, queryStateToQueryString } from "@/lib/formater";
import { Product } from "@/types/Product";
import { Store } from "@/types/Store";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { useInView } from "react-intersection-observer";

export default function CartPage() {
  const { cartTotal, totalItems, items, emptyCart } = useCart();

  const itemGroups = groupItemByStore(items);

  const router = useRouter();

  useEffect(() => {
    router.prefetch("/user/checkout");
  }, [router]);

  return (
    <>
      <Meta title="Keranjang | Salesprint" />
      <div className="py-8 container space-y-16 relative h-full">
        <section className="space-y-6">
          <h3 className="font-semibold text-2xl">Keranjang</h3>
          <div className="flex gap-6 items-start">
            <div className="flex-grow space-y-4">
              <BaseCard className="flex items-center justify-between">
                <p className="font-semibold">
                  {`Jumlah barang (${totalItems})`}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  outline
                  onClick={() => emptyCart()}
                >
                  Hapus Semua Barang
                </Button>
              </BaseCard>
              {itemGroups.map((group) => (
                <BaseCard key={group.store.id} className="space-y-4">
                  <p className="font-semibold">{group.store.name}</p>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <CartItemCard key={item.productVariant.id} item={item} />
                    ))}
                  </div>
                </BaseCard>
              ))}
            </div>
            <BaseCard className="flex-shrink-0 w-96 sticky top-28 space-y-4">
              <p className="font-semibold text-xl">Ringkasan Belanja</p>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold text-lg">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <Button
                onClick={() => router.push("/user/checkout")}
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={totalItems <= 0}
              >
                Beli
              </Button>
            </BaseCard>
          </div>
        </section>
        <section className="space-y-6">
          <h3 className="font-semibold text-2xl">Anda mungkin tertarik</h3>
          <RecomendationSection />
        </section>
      </div>
    </>
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  const { updateItemQuantity, removeItem } = useCart();
  return (
    <div className="flex items-start justify-between">
      <Link
        href={
          item.product.store?.slug
            ? `${item.product.store.slug}/${item.product.slug}`
            : "#"
        }
        className="flex items-start gap-2"
      >
        <div className="h-20 aspect-square bg-cover bg-center relative rounded overflow-hidden">
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
      </Link>

      <div className="flex self-stretch flex-col justify-between items-end">
        <span className="font-semibold text-lg">
          {formatPrice(item.productVariant.price)}
        </span>
        <div className="flex items-center gap-2">
          <MdOutlineDelete
            className="text-2xl opacity-60 cursor-pointer hover:opacity-100"
            onClick={() => removeItem(item.product.id, item.productVariant.id)}
          />
          <div className="flex items-center">
            <Button
              type="button"
              className="rounded-r-none"
              variant="base"
              size="sm"
              outline
              onClick={() => {
                if (item.quantity > 1) {
                  updateItemQuantity(
                    item.product.id,
                    item.productVariant.id,
                    item.quantity - 1
                  );
                } else {
                  removeItem(item.product.id, item.productVariant.id);
                }
              }}
            >
              -
            </Button>
            <FormInput
              id="quantity"
              className="w-12 text-sm h-8 rounded-none text-center"
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const value = e.target.value;
                if (value && Number(value) > 0) {
                  updateItemQuantity(
                    item.product.id,
                    item.productVariant.id,
                    Number(value)
                  );
                }
              }}
            />
            <Button
              type="button"
              className="rounded-l-none"
              variant="base"
              size="sm"
              outline
              onClick={() => {
                updateItemQuantity(
                  item.product.id,
                  item.productVariant.id,
                  item.quantity + 1
                );
              }}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecomendationSection() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { ref: sectionStartRef, inView: sectionStartInView } = useInView();
  const { ref: lastItemRef, inView: lastItemInView } = useInView();
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [QueryKeys.PAGINATED_PRODUCTS_RECOMENDATION, userId],
    queryFn: ({ pageParam = 1 }) =>
      getPaginatedData<Product>(
        QueryKeys.PAGINATED_PRODUCTS_RECOMENDATION,
        queryStateToQueryString<Product>({
          limit: 12,
          page: pageParam,
          with: ["product_images", "category", "store"],
          withCount: ["reviews", "order_items"],
        }),
        userToken
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : null,
    enabled: sectionStartInView,
  });

  useEffect(() => {
    if (lastItemInView && hasNextPage) {
      fetchNextPage();
    }
  }, [lastItemInView, fetchNextPage, hasNextPage]);

  return (
    <div ref={sectionStartRef}>
      {!data ? null : (
        <div className="grid grid-cols-6 gap-3">
          {data.pages.map((group, idx) =>
            group?.data.map((product, i) => (
              <ProductCard
                ref={
                  data.pages.length === idx + 1 && group.data.length === i + 1
                    ? lastItemRef
                    : undefined
                }
                key={product.id}
                product={product}
              />
            ))
          )}
        </div>
      )}

      {(isFetching || isFetchingNextPage) && (
        <div className="py-8 flex items-center justify-center gap-2">
          <Spinner className="w-8 h-8 text-primary" />
          <span className="text-lg">Memuat...</span>
        </div>
      )}
    </div>
  );
}

function groupItemByStore(items: CartItem[]) {
  let result: { store: Store; items: CartItem[] }[] = [];
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
      },
    ];
    return;
  });

  return result;
}
