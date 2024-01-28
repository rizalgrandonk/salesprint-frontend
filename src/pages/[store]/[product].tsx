import ProductCard from "@/components/ProductCard";
import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import Meta from "@/components/utils/Meta";
import ProductRating from "@/components/utils/ProductRating";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import { getPaginatedData } from "@/lib/api/data";
import { getProduct, getStoreProducts } from "@/lib/api/products";
import { getStoreBySlug } from "@/lib/api/stores";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_USER_IMAGE,
} from "@/lib/constants";
import {
  formatPrice,
  htmlToPlainText,
  queryStateToQueryString,
} from "@/lib/formater";
import { Product, Review, VariantCombination } from "@/types/Product";
import { Store } from "@/types/Store";
import { ProductVariant, VariantOption, VariantType } from "@/types/Variant";
import { MakePropertiesRequired } from "@/types/data";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import {
  MdArrowDropDown,
  MdChevronLeft,
  MdChevronRight,
  MdKeyboardArrowDown,
  MdLocationPin,
  MdOutlineStorefront,
  MdShoppingCart,
} from "react-icons/md";
import { useInView } from "react-intersection-observer";

export const getServerSideProps = (async (ctx) => {
  const storeSlug = ctx.query.store?.toString();
  const productSlug = ctx.query.product?.toString();

  // const product =
  //   ;

  // const store = ;

  const [product, store, storeProducts] = await Promise.all([
    storeSlug && productSlug
      ? getProduct<
          | "product_images"
          | "product_variants"
          | "category"
          | "reviews_count"
          | "order_items_count"
        >(storeSlug, productSlug, {
          with: [
            "product_images",
            "product_variants.variant_options.variant_type",
            "category",
          ],
          withCount: ["reviews", "order_items"],
        })
      : null,
    storeSlug
      ? getStoreBySlug<
          "reviews_count" | "order_items_count" | "products_count"
        >(storeSlug, {
          withCount: ["reviews", "order_items", "products"],
        })
      : null,
    storeSlug
      ? getStoreProducts<
          | "product_images"
          | "category"
          | "reviews_count"
          | "order_items_count"
          | "store"
        >(storeSlug, {
          with: ["product_images", "category", "store"],
          withCount: ["reviews", "order_items"],
          filters: [
            {
              field: "slug_with_store",
              operator: "!=",
              value: `${storeSlug}/${productSlug}`,
            },
          ],
          orderBy: {
            field: "average_rating",
            value: "desc",
          },
          limit: 5,
        })
      : null,
  ]);

  return { props: { product, store, storeProducts } };
}) satisfies GetServerSideProps<{
  product: Product | null;
  store: Store | null;
  storeProducts: Product[] | null;
}>;

export default function ProductPage({
  product,
  store,
  storeProducts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!product || !store) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-4xl">
        Halaman Tidak ditemukan
      </div>
    );
  }

  const { variantsTypeOptions, variantCombinations } = transformProductVariants(
    product.product_variants
  );

  return (
    <>
      <Meta
        title={`Jual ${product.name} - ${store.name} | Salesprint`}
        description={htmlToPlainText(product.description)}
        keywords={`${product.category?.name}, ${store.name}`}
        shareImage={
          product.product_images?.find((image) => image.main_image)
            ?.image_url ||
          product.product_images?.[0]?.image_url ||
          DEFAULT_STORE_CATEGORY_IMAGE
        }
      />

      <div className="py-8 space-y-12">
        <section className="container p-4 flex flex-col lg:flex-row lg:gap-2 rounded-sm">
          <div className="w-full lg:w-1/2 flex flex-col lg:flex-row-reverse gap-2">
            <div className="relative w-full lg:w-5/6 aspect-square bg-white dark:bg-gray-800 rounded-sm overflow-hidden">
              <Image
                src={
                  product.product_images?.find((image) => image.main_image)
                    ?.image_url ||
                  product.product_images?.[0]?.image_url ||
                  DEFAULT_STORE_CATEGORY_IMAGE
                }
                alt={product.name}
                fill
                loading="lazy"
                className="object-contain"
                sizes="50vw"
              />
            </div>
            <div className="w-full lg:w-1/6 flex lg:flex-col items-center gap-2">
              {product.product_images &&
                product.product_images.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-40 lg:w-full lg:h-auto aspect-square bg-white dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary hover:dark:border-primary"
                  >
                    <Image
                      src={image.image_url}
                      alt={product.name}
                      fill
                      loading="lazy"
                      className="object-contain"
                      sizes="20vw"
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-3 py-6 lg:py-2 lg:pl-12">
            <h1 className="text-3xl font-medium">{product.name}</h1>
            <div className="flex items-center divide-x divide-gray-500">
              <div className="flex items-center gap-1 pr-4">
                <span className="font-semibold">{product.average_rating}</span>
                <ProductRating
                  className="text-base"
                  rating={product.average_rating}
                />
              </div>
              <div className="flex items-center gap-1 px-4">
                <span className="font-semibold">{product.reviews_count}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Reviews
                </span>
              </div>
              <div className="flex items-center gap-1 pl-4">
                <span className="font-semibold">
                  {product.order_items_count}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Terjual
                </span>
              </div>
            </div>
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700" />
            <h2 className="text-5xl text-primary font-semibold">
              {formatPrice(product.price)}
            </h2>

            <div className="py-8 space-y-5">
              <div className="flex items-start">
                <div className="w-1/5">
                  <span className="text-gray-500 dark:text-gray-400">
                    Kategory
                  </span>
                </div>
                <div className="w-4/5">
                  <Link
                    href="#"
                    className="text-primary font-medium px-3 py-1 bg-primary/10 hover:bg-primary/20 transition-all"
                  >
                    {product.category.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1/5">
                  <span className="text-gray-500 dark:text-gray-400">Stok</span>
                </div>
                <div className="w-4/5">
                  <span>{product.stok}</span>
                </div>
              </div>

              {variantsTypeOptions.map((variantsTypeOption) => (
                <div
                  key={variantsTypeOption.variant_type.id}
                  className="flex items-start"
                >
                  <div className="w-1/5">
                    <span className="text-gray-500 dark:text-gray-400">
                      {variantsTypeOption.variant_type.name}
                    </span>
                  </div>
                  <div className="w-4/5 flex items-center flex-wrap gap-2">
                    {variantsTypeOption.variant_options.map((option) => (
                      <Button
                        type="button"
                        key={option.id}
                        variant="base"
                        outline
                      >
                        {option.value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-start">
                <div className="w-1/5">
                  <span className="text-gray-500 dark:text-gray-400">
                    Kuantitas
                  </span>
                </div>
                <div className="w-4/5 flex items-center flex-wrap">
                  <Button
                    type="button"
                    className="rounded-r-none"
                    variant="base"
                    outline
                  >
                    -
                  </Button>
                  <FormInput
                    id="quantity"
                    className="w-16 text-sm h-9 rounded-none text-center"
                    defaultValue="1"
                  />
                  <Button
                    type="button"
                    className="rounded-l-none"
                    variant="base"
                    outline
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="text-lg h-12"
            >
              <MdShoppingCart className="text-2xl" />
              Masukan Keranjang
            </Button>
          </div>
        </section>

        <div className="container flex items-stretch gap-16">
          {/* <div className="lg:col-span-2 h-24 bg-gray-500">Store</div> */}
          <div className="flex-grow space-y-10">
            <section className="p-4 flex flex-col lg:flex-row lg:gap-2 lg:items-start lg:justify-between border-t border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="relative h-24 aspect-square rounded-full overflow-hidden">
                  <Image
                    src={store.image || DEFAULT_STORE_CATEGORY_IMAGE}
                    alt={store.name}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <h3 className="text-xl my-0 leading-none">{store.name}</h3>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-1">
                      <MdLocationPin className="text-base" />
                      <span>{store.city}</span>
                    </div>
                  </div>
                  <Button type="button" variant="primary" size="sm" outline>
                    <MdOutlineStorefront className="text-base" />
                    Kunjungi Toko
                  </Button>
                </div>
              </div>

              <div className="flex lg:items-center flex-col lg:flex-row lg:gap-8">
                <div className="flex flex-col items-end justify-start">
                  <span className="text-gray-500 dark:text-gray-400">
                    Review
                  </span>
                  <span className="text-primary font-semibold text-4xl">
                    {store.reviews_count}
                  </span>
                </div>
                <div className="flex flex-col items-end justify-start">
                  <span className="text-gray-500 dark:text-gray-400">
                    Penjualan
                  </span>
                  <span className="text-primary font-semibold text-4xl">
                    {store.order_items_count}
                  </span>
                </div>
                <div className="flex flex-col items-end justify-start">
                  <span className="text-gray-500 dark:text-gray-400">
                    Produk
                  </span>
                  <span className="text-primary font-semibold text-4xl">
                    {store.products_count}
                  </span>
                </div>
              </div>
            </section>

            <section className="p-4 space-y-6">
              <h3 className="font-semibold text-2xl">Deskripsi Produk</h3>
              <div
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="prose dark:prose-invert line-clamp-6 max-w-none"
              />
              <button
                type="button"
                className="text-primary text-sm bg-transparent outline-none flex items-center gap-1 hover:text-primary/90 transition-all"
              >
                Tampilkan lebih banyak
                <MdKeyboardArrowDown className="text-lg" />
              </button>
            </section>

            <section className="p-4 space-y-6">
              <h3 className="font-semibold text-2xl">Review</h3>
              <ReviewsSection
                product={product}
                storeSlug={store.slug}
                productSlug={product.slug}
              />
            </section>
          </div>

          <section className="w-1/4 flex-shrink-0 space-y-6">
            <div>
              <h3 className="font-semibold text-2xl">Produk Toko</h3>
              <Link
                href="#"
                className="flex items-center gap-1 text-primary hover:text-primary/90"
              >
                <span className="underline">Lihat semua</span>
                <FaAngleDoubleRight />
              </Link>
            </div>
            <div className="lg:max-h-[84rem] overflow-auto">
              <div className="flex flex-col gap-4">
                {storeProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="container p-4 space-y-6">
          <h3 className="font-semibold text-2xl">Anda mungkin tertarik</h3>
          <RecomendationSection product={product} />
        </section>
      </div>
    </>
  );
}

type ReviewsSectionProps = {
  storeSlug: string;
  productSlug: string;
  product: Product;
};

function ReviewsSection({
  storeSlug,
  productSlug,
  product,
}: ReviewsSectionProps) {
  const path = `/paginated/products/${storeSlug}/${productSlug}/reviews`;

  const { ref, inView } = useInView();

  const {
    data: reviews,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setFilter,
    refetch,
    isFetching,
  } = useDataTable<MakePropertiesRequired<Review, "user">>(
    path,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      limit: 5,
      with: ["user"],
    },
    inView
  );

  return (
    <div ref={ref}>
      {isLoading ? (
        <div>Memuat Reviews...</div>
      ) : !reviews ? (
        <div>Belum ada review</div>
      ) : (
        <div>
          <BaseCard className="flex items-center gap-8 p-8">
            <div className="space-y-0.5">
              <p className="text-primary">
                <span className="text-3xl">{product.average_rating}</span> dari
                5
              </p>
              <ProductRating
                className="text-2xl text-primary"
                rating={product.average_rating}
              />
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <Button type="button" variant="base" outline>
                Semua
              </Button>
              <Button type="button" variant="base" outline>
                5 Bintang
              </Button>
              <Button type="button" variant="base" outline>
                4 Bintang
              </Button>
              <Button type="button" variant="base" outline>
                3 Bintang
              </Button>
              <Button type="button" variant="base" outline>
                2 Bintang
              </Button>
              <Button type="button" variant="base" outline>
                1 Bintang
              </Button>
            </div>
          </BaseCard>

          <div className="divide-y divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 space-y-2">
                <div className="flex items-start gap-4">
                  <div className="relative h-10 aspect-square rounded-full overflow-hidden">
                    <Image
                      src={review.user.image || DEFAULT_USER_IMAGE}
                      alt={review.user.username}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs my-0 leading-none">
                      {review.user.username}
                    </p>
                    <ProductRating className="text-xs" rating={review.rating} />
                    <p className="text-xs my-0 leading-none text-gray-500 dark:text-gray-400">
                      {format(new Date(review.created_at), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm">{review.coment}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-start gap-2 py-4">
            {!!previousPage && (
              <Button onClick={() => previousPage()} size="sm" outline>
                <MdChevronLeft className="text-xl" />
                <span>Sebelumnya</span>
              </Button>
            )}
            {!!nextPage && (
              <Button onClick={() => nextPage()} size="sm" outline>
                <span>Berikutnya</span>
                <MdChevronRight className="text-xl" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type RecomendationSectionProps = {
  product: Product;
};
function RecomendationSection({ product }: RecomendationSectionProps) {
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
    queryKey: ["/paginated/products"],
    queryFn: ({ pageParam = 1 }) =>
      getPaginatedData<Product>(
        "/paginated/products",
        queryStateToQueryString<Product>({
          limit: 8,
          page: pageParam,
          with: ["product_images", "category", "store"],
          withCount: ["reviews", "order_items"],
          orderBy: {
            field: "average_rating",
            value: "desc",
          },
          filters: [
            {
              field: "slug_with_store",
              operator: "!=",
              value: product.slug_with_store,
            },
          ],
        })
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

  console.log({ data });

  return (
    <div ref={sectionStartRef}>
      {!data ? (
        <div>Kosong</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[28rem] lg:auto-rows-[28rem] gap-6">
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

      {(isFetching || isFetchingNextPage) && <div>Memuat...</div>}

      {/* {!(isFetching || isFetchingNextPage) && <div ref={ref}></div>} */}
    </div>
  );

  // return (
  //   <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[28rem] lg:auto-rows-[28rem] gap-6">
  //     {[].map((product) => (
  //       <ProductCard key={product.id} product={product} />
  //     ))}
  //   </div>
  // );
}

function transformProductVariants(productVariants?: ProductVariant[]) {
  const variantsTypeOptions: {
    variant_type: VariantType;
    variant_options: VariantOption[];
  }[] = [];
  const variantCombinations: VariantCombination[] = [];

  if (!productVariants) {
    return {
      variantsTypeOptions: variantsTypeOptions,
      variantCombinations: variantCombinations,
    };
  }

  const variantsTypeOptionMap = new Map<
    string,
    {
      variant_type: VariantType;
      variant_options: VariantOption[];
    }
  >();

  productVariants.forEach((product) => {
    product.variant_options?.forEach((option) => {
      if (
        !variantsTypeOptionMap.has(option.variant_type_id) &&
        option.variant_type
      ) {
        variantsTypeOptionMap.set(option.variant_type_id, {
          variant_type: option.variant_type,
          variant_options: [],
        });
      }

      const variantsTypeOption = variantsTypeOptionMap.get(
        option.variant_type_id
      );
      if (
        variantsTypeOption &&
        !variantsTypeOption.variant_options.some((opt) => opt.id === option.id)
      ) {
        variantsTypeOption.variant_options.push(option);
      }
    });

    const comb: VariantCombination = {
      price: product.price.toString(),
      stok: product.stok.toString(),
      sku: product.sku,
    };

    product.variant_options?.forEach((option) => {
      const variantsTypeOption = variantsTypeOptionMap.get(
        option.variant_type_id
      );
      if (variantsTypeOption) {
        comb[variantsTypeOption.variant_type.name] = option.value;
      }
    });

    variantCombinations.push(comb);
  });

  variantsTypeOptions.push(...Array.from(variantsTypeOptionMap.values()));

  return {
    variantsTypeOptions: variantsTypeOptions,
    variantCombinations: variantCombinations,
  };
}
