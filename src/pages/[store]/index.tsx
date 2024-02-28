import ProductCard from "@/components/ProductCard";
import StoreBannersCarousel from "@/components/home/StoreBannersCarousel";
import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import Meta from "@/components/utils/Meta";
import Spinner from "@/components/utils/Spinner";
import useDataTable from "@/hooks/useDataTable";
import { getStoreProducts } from "@/lib/api/products";
import { getStoreBySlug } from "@/lib/api/stores";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { generatePaginationArray } from "@/lib/formater";
import { Product } from "@/types/Product";
import { Store } from "@/types/Store";
import { MakePropertiesRequired } from "@/types/data";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { MdChevronLeft, MdChevronRight, MdLocationPin } from "react-icons/md";
import { RiStackFill, RiStarFill } from "react-icons/ri";
import { useInView } from "react-intersection-observer";

export const getServerSideProps = (async (ctx) => {
  const storeSlug = ctx.query.store?.toString();
  const productSlug = ctx.query.product?.toString();

  const [store] = await Promise.all([
    storeSlug
      ? getStoreBySlug<
          | "reviews_count"
          | "order_items_count"
          | "reviews_avg_rating"
          | "products_count"
          | "store_banners"
          | "store_categories"
        >(storeSlug, {
          with: ["store_banners", "store_categories"],
          withCount: ["reviews", "order_items", "products"],
          withAvgs: [{ relation: "reviews", field: "rating" }],
        })
      : null,
  ]);

  if (!store) {
    return {
      notFound: true,
    };
  }

  return { props: { store } };
}) satisfies GetServerSideProps<{
  store: Store;
}>;

export default function StorePage({
  store,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <>
      <Meta
        title={`${store.name} | Salesprint`}
        description={store.store_description}
        keywords={`${store.name}`}
        shareImage={store.image || DEFAULT_STORE_CATEGORY_IMAGE}
      />
      <div className="container py-8 space-y-8">
        <section className="py-4 px-8 flex flex-col lg:flex-row lg:gap-2 lg:items-center lg:justify-between border-b border-t border-gray-700">
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
            <div className="space-y-1">
              <h3 className="text-2xl my-0 leading-none font-medium">
                {store.name}
              </h3>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-1">
                <MdLocationPin className="text-base" />
                <span>{store.city}</span>
              </div>
            </div>
          </div>

          <div className="flex lg:items-center flex-col lg:flex-row lg:gap-8">
            <div className="flex flex-col items-end justify-start">
              <span className="text-gray-500 dark:text-gray-400">
                Penilaian
              </span>
              <div className="flex items-center gap-2">
                <RiStarFill className="text-yellow-500" />
                <span className="text-primary font-semibold text-2xl">
                  {store.reviews_avg_rating.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-start">
              <span className="text-gray-500 dark:text-gray-400">Ulasan</span>
              <span className="text-primary font-semibold text-2xl">
                {store.reviews_count}
              </span>
            </div>
            <div className="flex flex-col items-end justify-start">
              <span className="text-gray-500 dark:text-gray-400">
                Penjualan
              </span>
              <span className="text-primary font-semibold text-2xl">
                {store.order_items_count}
              </span>
            </div>
            <div className="flex flex-col items-end justify-start">
              <span className="text-gray-500 dark:text-gray-400">Produk</span>
              <span className="text-primary font-semibold text-2xl">
                {store.products_count}
              </span>
            </div>
          </div>
        </section>

        {store.store_banners && (
          <StoreBannersCarousel>
            {store.store_banners?.map((banner) => (
              <div
                key={banner.id}
                className="w-full aspect-[9/4] relative rounded overflow-hidden"
              >
                <Image
                  src={banner.image || DEFAULT_STORE_CATEGORY_IMAGE}
                  alt={store.name}
                  fill
                  sizes="100vw"
                  loading="lazy"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </StoreBannersCarousel>
        )}

        <section className="p-8 min-h-[10rem] border-b border-t border-gray-700">
          {store.store_description}
        </section>

        <ProductSection storeSlug={store.slug} />
      </div>
    </>
  );
}
type ProductSectionProps = {
  storeSlug: string;
};
function ProductSection({ storeSlug }: ProductSectionProps) {
  const path = `/paginated/stores/${storeSlug}/products`;

  const { ref, inView } = useInView();

  const {
    data: products,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setPage,
    setFilter,
    refetch,
    isFetching,
  } = useDataTable<
    MakePropertiesRequired<Product, "product_images" | "category" | "store">
  >(
    path,
    {
      orderBy: {
        field: "average_rating",
        value: "desc",
      },
      limit: 12,
      with: ["product_images", "category", "store"],
      withCount: ["reviews", "order_items"],
    },
    { enabled: inView }
  );

  const paginationButtons = generatePaginationArray(
    queryState.page,
    summaryData?.last_page ?? 1,
    5
  );

  return (
    <div ref={ref}>
      {isLoading ? (
        <div className="py-8 flex items-center justify-center gap-2">
          <Spinner className="w-8 h-8 text-primary" />
          <span className="text-lg">Memuat...</span>
        </div>
      ) : !products ? (
        <div>Belum ada produk</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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
  );
}
