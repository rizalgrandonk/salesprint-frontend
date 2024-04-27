import ProductCard from "@/components/ProductCard";
import BaseCard from "@/components/utils/BaseCard";
import BaseModal from "@/components/utils/BaseModal";
import { Button, ButtonLink } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import Meta from "@/components/utils/Meta";
import ProductRating from "@/components/utils/ProductRating";
import Spinner from "@/components/utils/Spinner";
import QueryKeys from "@/constants/queryKeys";
import { useCart } from "@/contexts/CartContext";
import useDataTable from "@/hooks/useDataTable";
import { getPaginatedData } from "@/lib/api/data";
import { getProduct, getStoreProducts } from "@/lib/api/products";
import { getStoreBySlug } from "@/lib/api/stores";
import { DEFAULT_STORE_CATEGORY_IMAGE, DEFAULT_USER_IMAGE } from "@/lib/constants";
import {
  formatPrice,
  generatePaginationArray,
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import {
  MdArrowDropDown,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdKeyboardArrowDown,
  MdLocationPin,
  MdOutlineStorefront,
  MdShoppingCart,
} from "react-icons/md";
import { useInView } from "react-intersection-observer";
import { twMerge } from "tailwind-merge";

const MAX_RECOMENDATION_PAGE = Number(process.env.NEXT_PUBLIC_MAX_RECOMENDATION_PAGE ?? 5);

export const getServerSideProps = (async (ctx) => {
  const storeSlug = ctx.query.store?.toString();
  const productSlug = ctx.query.product?.toString();

  const [product, store, storeProducts] = await Promise.all([
    storeSlug && productSlug
      ? getProduct<
          "product_images" | "product_variants" | "category" | "reviews_count" | "order_items_count"
        >(storeSlug, productSlug, {
          with: ["product_images", "product_variants.variant_options.variant_type", "category"],
          withCount: ["reviews", "order_items"],
        })
      : null,
    storeSlug
      ? getStoreBySlug<"reviews_count" | "order_items_count" | "products_count">(storeSlug, {
          withCount: ["reviews", "order_items", "products"],
        })
      : null,
    storeSlug
      ? getStoreProducts<
          "product_images" | "category" | "reviews_count" | "order_items_count" | "store"
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

  if (!product || !store) {
    return {
      notFound: true,
    };
  }

  return { props: { product, store, storeProducts } };
}) satisfies GetServerSideProps<{
  product: Product;
  store: Store;
  storeProducts: Product[] | null;
}>;

export default function ProductPage({
  product,
  store,
  storeProducts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const userData = session?.user;

  const { variantsTypeOptions, variantCombinations } = transformProductVariants(
    product.product_variants
  );

  const [isDescriptionExpand, setIsDescriptionExpand] = useState(false);
  const [quantityInput, setQuantityInput] = useState("1");
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedVariants = findSelectedVariants(variantsTypeOptions, searchParams);

  const selectVariant = (type: string, option: string) => {
    const selectedVariantTypeOption = variantsTypeOptions.find(
      (vars) =>
        vars.variant_type.name === type && vars.variant_options.some((opt) => opt.value === option)
    );
    if (!selectedVariantTypeOption) {
      return;
    }

    const queryStrings: string[] = [];
    Object.keys(selectedVariants).forEach((key) => {
      if (key === type) {
        queryStrings.push(`${key}=${option}`);
        return;
      }
      if (!selectedVariants[key]) {
        return;
      }
      queryStrings.push(`${key}=${selectedVariants[key]}`);
      return;
    });

    router.push(`/${store.slug}/${product.slug}?${queryStrings.join("&")}`, undefined, {
      shallow: true,
    });
  };

  const isAllVariantSelected = !variantsTypeOptions.some(
    (vars) => !selectedVariants[vars.variant_type.name]
  );

  const selectedProductVariant =
    variantsTypeOptions.length <= 0 && product.product_variants.length === 1
      ? product.product_variants[0]
      : product.product_variants.find((prodVar) => {
          return prodVar.variant_options?.some((opt) => {
            return (
              opt.variant_type?.name &&
              !!selectedVariants[opt.variant_type.name] &&
              selectedVariants[opt.variant_type.name] === opt.value
            );
          });
        });

  const addProductToCart = () => {
    if (!!userData?.role && userData.role !== "user") {
      return;
    }
    if (Number(quantityInput) <= 0) {
      return;
    }
    if (!isAllVariantSelected) {
      return;
    }

    if (!selectedProductVariant) {
      return;
    }

    addItem({
      product: {
        ...product,
        store: store,
      },
      productVariant: selectedProductVariant,
      quantity: Number(quantityInput),
    });
    setQuantityInput("1");
    setIsCartModalOpen(true);
  };

  return (
    <>
      <Meta
        title={`Jual ${product.name} - ${store.name} | Salesprint`}
        description={htmlToPlainText(product.description)}
        keywords={`${product.category?.name}, ${store.name}`}
        shareImage={
          product.product_images?.find((image) => image.main_image)?.image_url ||
          product.product_images?.[0]?.image_url ||
          DEFAULT_STORE_CATEGORY_IMAGE
        }
      />

      <div className="py-2 lg:py-8 space-y-6 lg:space-y-16">
        <section className="container flex flex-col lg:flex-row lg:gap-2 rounded-sm">
          <ImageSection product={product} key={product.id} />
          <div className="w-full lg:w-1/2 space-y-3 py-6 lg:py-2 lg:pl-12">
            <h1 className="text-2xl lg:text-3xl font-medium">{product.name}</h1>
            <div className="flex items-center divide-x divide-gray-500">
              <div className="flex items-center gap-1 pr-4">
                <span className="font-semibold">{product.average_rating.toFixed(1)}</span>
                <ProductRating className="text-base" rating={product.average_rating} />
              </div>
              <div className="flex items-center gap-1 px-4">
                <span className="font-semibold">{product.reviews_count}</span>
                <span className="text-gray-500 dark:text-gray-400">Reviews</span>
              </div>
              <div className="flex items-center gap-1 pl-4">
                <span className="font-semibold">{product.order_items_count}</span>
                <span className="text-gray-500 dark:text-gray-400">Terjual</span>
              </div>
            </div>
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700" />
            <h2 className="text-4xl lg:text-5xl text-primary font-semibold">
              {formatPrice(product.price)}
            </h2>

            <div className="py-6 lg:py-8 space-y-3 lg:space-y-5">
              <div className="flex items-start">
                <div className="w-1/4 lg:w-1/5">
                  <span className="text-gray-500 dark:text-gray-400">Kategory</span>
                </div>
                <div className="w-3/4 lg:w-4/5">
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-primary font-medium px-3 py-1 bg-primary/10 hover:bg-primary/20 transition-all"
                  >
                    {product.category.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1/4 lg:w-1/5">
                  <span className="text-gray-500 dark:text-gray-400">Stok</span>
                </div>
                <div className="w-3/4 lg:w-4/5">
                  <span>{product.stok}</span>
                </div>
              </div>

              {variantsTypeOptions.map((variantsTypeOption) => (
                <div key={variantsTypeOption.variant_type.id} className="flex items-start">
                  <div className="w-1/4 lg:w-1/5">
                    <span className="text-gray-500 dark:text-gray-400">
                      {variantsTypeOption.variant_type.name}
                    </span>
                  </div>
                  <div className="w-3/4 lg:w-4/5 flex items-center flex-wrap gap-2">
                    {variantsTypeOption.variant_options.map((option) => (
                      <Button
                        onClick={() =>
                          selectVariant(variantsTypeOption.variant_type.name, option.value)
                        }
                        type="button"
                        key={option.id}
                        variant={
                          selectedVariants[variantsTypeOption.variant_type.name] === option.value
                            ? "primary"
                            : "base"
                        }
                        outline
                      >
                        {option.value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {(!userData?.role || userData.role === "user") && (
                <div className="flex items-start">
                  <div className="w-1/4 lg:w-1/5">
                    <span className="text-gray-500 dark:text-gray-400">Kuantitas</span>
                  </div>
                  <div className="w-3/4 lg:w-4/5 flex items-center flex-wrap">
                    <Button
                      type="button"
                      className="rounded-r-none"
                      variant="base"
                      outline
                      onClick={() => {
                        if (Number(quantityInput) > 1) {
                          setQuantityInput(`${Number(quantityInput) - 1}`);
                        }
                      }}
                    >
                      -
                    </Button>
                    <FormInput
                      id="quantity"
                      className="w-16 text-sm h-9 rounded-none text-center"
                      type="number"
                      min={1}
                      value={quantityInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && Number(value) > 0) {
                          setQuantityInput(value);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      className="rounded-l-none"
                      variant="base"
                      outline
                      onClick={() => {
                        setQuantityInput(`${Number(quantityInput) + 1}`);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {(!userData?.role || userData.role === "user") && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full lg:w-auto text-lg h-12"
                disabled={!isAllVariantSelected}
                onClick={() => addProductToCart()}
              >
                <MdShoppingCart className="text-2xl" />
                Masukan Keranjang
              </Button>
            )}
          </div>
        </section>

        <div className="container flex flex-col lg:flex-row items-stretch gap-6 lg:gap-16">
          {/* <div className="lg:col-span-2 h-24 bg-gray-500">Store</div> */}
          <div className="flex-grow space-y-8 lg:space-y-12">
            <section className="p-4 flex flex-col lg:flex-row gap-6 lg:gap-2 lg:items-start lg:justify-between border-t border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="relative h-20 lg:h-24 aspect-square rounded-full overflow-hidden">
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
                  <ButtonLink
                    href={`/${store.slug}`}
                    type="button"
                    variant="primary"
                    size="sm"
                    outline
                  >
                    <MdOutlineStorefront className="text-base" />
                    Kunjungi Toko
                  </ButtonLink>
                </div>
              </div>

              <div className="flex items-start lg:items-center flex-col lg:flex-row lg:gap-8">
                <div className="flex flex-row-reverse lg:flex-col gap-2 lg:gap-0 items-center lg:items-end justify-start">
                  <span className="text-gray-500 dark:text-gray-400">Review</span>
                  <span className="text-primary font-semibold text-2xl lg:text-4xl">
                    {store.reviews_count}
                  </span>
                </div>
                <div className="flex flex-row-reverse lg:flex-col gap-2 lg:gap-0 items-center lg:items-end justify-start">
                  <span className="text-gray-500 dark:text-gray-400">Penjualan</span>
                  <span className="text-primary font-semibold text-2xl lg:text-4xl">
                    {store.order_items_count}
                  </span>
                </div>
                <div className="flex flex-row-reverse lg:flex-col gap-2 lg:gap-0 items-center lg:items-end justify-start">
                  <span className="text-gray-500 dark:text-gray-400">Produk</span>
                  <span className="text-primary font-semibold text-2xl lg:text-4xl">
                    {store.products_count}
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-4 lg:space-y-6">
              <h3 className="font-semibold text-2xl">Deskripsi Produk</h3>
              <div
                dangerouslySetInnerHTML={{ __html: product.description }}
                className={twMerge(
                  "prose dark:prose-invert max-w-none transition-all",
                  isDescriptionExpand ? "" : "line-clamp-6"
                )}
              />
              <button
                type="button"
                className="text-primary text-sm bg-transparent outline-none flex items-center gap-1 hover:text-primary/90 transition-all"
                onClick={() => setIsDescriptionExpand((prev) => !prev)}
              >
                {`Tampilkan lebih ${isDescriptionExpand ? "sedikit" : "banyak"}`}
                <MdKeyboardArrowDown
                  className={twMerge(
                    "text-lg transition-all",
                    isDescriptionExpand ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>
            </section>

            <section className="space-y-4 lg:space-y-6">
              <h3 className="font-semibold text-2xl">Review</h3>
              <ReviewsSection product={product} storeSlug={store.slug} productSlug={product.slug} />
            </section>
          </div>

          <section className="lg:w-1/5 flex-shrink-0 space-y-4 lg:space-y-6">
            <div>
              <h3 className="font-semibold text-2xl">Produk Toko</h3>
              <Link
                href={`/${store.slug}`}
                className="flex items-center gap-1 text-primary hover:text-primary/90"
              >
                <span className="underline">Lihat semua</span>
                <FaAngleDoubleRight />
              </Link>
            </div>
            <div className="lg:max-h-[76rem] overflow-auto">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {storeProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="container space-y-6">
          <h3 className="font-semibold text-2xl">Anda mungkin tertarik</h3>
          <RecomendationSection product={product} />
        </section>
      </div>

      <BaseModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        className="w-full max-w-2xl overflow-hidden transition-all"
      >
        <div className="pb-2 flex items-center justify-between">
          <h3 className="text-xl font-medium leading-6">Berhasil menambah ke keranjang</h3>
          <MdClose
            onClick={() => setIsCartModalOpen(false)}
            className="text-xl cursor-pointer opacity-80 hover:opacity-100"
          />
        </div>
        <BaseCard className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 h-24 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={
                  product.product_images?.find((image) => image.main_image)?.image_url ||
                  product.product_images?.[0]?.image_url ||
                  DEFAULT_STORE_CATEGORY_IMAGE
                }
                alt={product.name}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="space-y-1">
              <p className="leading-tight text-sm lg:text-base line-clamp-2">{product.name}</p>
              <div className="flex items-center gap-2">
                {selectedProductVariant?.variant_options?.map((opt) => (
                  <span
                    key={opt.id}
                    className="font-medium text-xxs lg:text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600"
                  >
                    {opt.value}
                  </span>
                ))}
              </div>
              {selectedProductVariant?.price && (
                <p className="font-semibold text-base lg:text-lg">
                  {formatPrice(selectedProductVariant.price)}
                </p>
              )}
            </div>
          </div>
          <ButtonLink href="/cart" variant="primary" size="sm">
            Lihat Keranjang
          </ButtonLink>
        </BaseCard>
      </BaseModal>
    </>
  );
}

type ImageSectionProps = {
  product: Product;
};
function ImageSection({ product }: ImageSectionProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.product_images?.find((image) => image.main_image)?.image_url ??
      product.product_images?.[0]?.image_url ??
      DEFAULT_STORE_CATEGORY_IMAGE
  );

  return (
    <div className="w-full lg:w-1/2 flex flex-col lg:flex-row-reverse gap-2">
      <div className="relative w-full lg:w-5/6 aspect-square bg-white dark:bg-gray-800 rounded-sm overflow-hidden">
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={product.name}
          fill
          loading="lazy"
          className="object-contain"
          sizes="50vw"
        />
      </div>
      <div className="w-full lg:w-1/6 flex lg:flex-col items-center gap-2 overflow-auto lg:max-h-[80vh] snap-both">
        {product.product_images &&
          product.product_images.map((image) => {
            return (
              <div
                onMouseEnter={() => setSelectedImage(image.image_url)}
                key={image.image_url}
                className={twMerge(
                  "snap-start flex-shrink-0 relative h-20 lg:w-full lg:h-auto aspect-square bg-white dark:bg-gray-800 rounded-sm overflow-hidden border-2 hover:border-primary hover:dark:border-primary",
                  image.image_url === selectedImage
                    ? "border-primary dark:border-primary"
                    : "border-gray-200 dark:border-gray-700"
                )}
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
            );
          })}
      </div>
    </div>
  );
}

type ReviewsSectionProps = {
  storeSlug: string;
  productSlug: string;
  product: Product;
};

function ReviewsSection({ storeSlug, productSlug, product }: ReviewsSectionProps) {
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
    setPage,
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
    { enabled: inView }
  );

  const selectedFilterRating = queryState.filters?.find(
    (fil) => fil.field === "rating" && fil.operator === "="
  )?.value;

  const paginationButtons = generatePaginationArray(
    queryState.page,
    summaryData?.last_page ?? 1,
    3
  );

  return (
    <div ref={ref}>
      {isLoading ? (
        <div className="py-8 flex items-center justify-center gap-2">
          <Spinner className="w-8 h-8 text-primary" />
          <span className="text-lg">Memuat...</span>
        </div>
      ) : !reviews ? (
        <div>Belum ada review</div>
      ) : (
        <div>
          <BaseCard className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 p-4 lg:p-8">
            <div className="space-y-0.5">
              <p className="text-primary">
                <span className="text-3xl">{product.average_rating.toFixed(1)}</span> dari 5
              </p>
              <ProductRating className="text-2xl text-primary" rating={product.average_rating} />
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <Button
                type="button"
                variant={!selectedFilterRating ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    {
                      field: "rating",
                      operator: "=",
                      value: null,
                    },
                  ])
                }
              >
                Semua
              </Button>
              <Button
                type="button"
                variant={selectedFilterRating === 5 ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    {
                      field: "rating",
                      operator: "=",
                      value: 5,
                    },
                  ])
                }
              >
                5 Bintang
              </Button>
              <Button
                type="button"
                variant={selectedFilterRating === 4 ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    {
                      field: "rating",
                      operator: "=",
                      value: 4,
                    },
                  ])
                }
              >
                4 Bintang
              </Button>
              <Button
                type="button"
                variant={selectedFilterRating === 3 ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    {
                      field: "rating",
                      operator: "=",
                      value: 3,
                    },
                  ])
                }
              >
                3 Bintang
              </Button>
              <Button
                type="button"
                variant={selectedFilterRating === 2 ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    {
                      field: "rating",
                      operator: "=",
                      value: 2,
                    },
                  ])
                }
              >
                2 Bintang
              </Button>
              <Button
                type="button"
                variant={selectedFilterRating === 1 ? "primary" : "base"}
                outline
                onClick={() =>
                  setFilter([
                    {
                      field: "rating",
                      operator: "=",
                      value: 1,
                    },
                  ])
                }
              >
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
                    <p className="text-xs my-0 leading-none">{review.user.username}</p>
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

          <div className="flex items-center justify-center py-4 gap-2">
            <Button
              size="sm"
              outline
              className="border-none px-1"
              disabled={!previousPage}
              onClick={() => {
                previousPage && previousPage();
              }}
            >
              <MdChevronLeft className="text-2xl" />
            </Button>
            {paginationButtons.map((pageText) => (
              <Button
                key={pageText}
                size="sm"
                outline={pageText !== queryState.page}
                className="border-none px-3"
                disabled={typeof pageText === "string"}
                onClick={() => {
                  typeof pageText === "number" && setPage(pageText);
                }}
              >
                <span>{pageText}</span>
              </Button>
            ))}
            <Button
              size="sm"
              outline
              className="border-none px-1"
              disabled={!nextPage}
              onClick={() => {
                nextPage && nextPage();
              }}
            >
              <MdChevronRight className="text-2xl" />
            </Button>
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
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { ref: sectionStartRef, inView: sectionStartInView } = useInView();
  const { ref: lastItemRef, inView: lastItemInView } = useInView();
  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [QueryKeys.PAGINATED_PRODUCTS_RECOMENDATION, userId],
      queryFn: ({ pageParam = 1 }) =>
        getPaginatedData<Product>(
          QueryKeys.PAGINATED_PRODUCTS_RECOMENDATION,
          queryStateToQueryString<Product>({
            limit: 12,
            page: pageParam,
            with: ["product_images", "category", "store"],
            withCount: ["reviews", "order_items"],
            filters: [
              {
                field: "slug_with_store",
                operator: "!=",
                value: product.slug_with_store,
              },
            ],
          }),
          userToken
        ),
      getNextPageParam: (lastPage, allPages) =>
        lastPage &&
        lastPage.current_page < lastPage.last_page &&
        lastPage.current_page < MAX_RECOMENDATION_PAGE
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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
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

function findSelectedVariants(
  variantsTypeOptions: {
    variant_type: VariantType;
    variant_options: VariantOption[];
  }[],
  searchParams: ReadonlyURLSearchParams
) {
  const selectedVariants: { [type: string]: string | null } = {};
  variantsTypeOptions.forEach((vars) => {
    const selectedOption = searchParams.get(vars.variant_type.name);
    selectedVariants[vars.variant_type.name] =
      selectedOption && vars.variant_options.some((opt) => opt.value === selectedOption)
        ? selectedOption
        : null;
  });

  return selectedVariants;
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
      if (!variantsTypeOptionMap.has(option.variant_type_id) && option.variant_type) {
        variantsTypeOptionMap.set(option.variant_type_id, {
          variant_type: option.variant_type,
          variant_options: [],
        });
      }

      const variantsTypeOption = variantsTypeOptionMap.get(option.variant_type_id);
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
      const variantsTypeOption = variantsTypeOptionMap.get(option.variant_type_id);
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
