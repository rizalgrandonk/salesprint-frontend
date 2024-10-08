import ProductCard from "@/components/ProductCard";
import CategoryList from "@/components/home/CategoryList";
import FeaturedProductsCarousel from "@/components/home/FeaturedProductsCarousel";
import LatestProductsCarousel from "@/components/home/LatestProductsCarousel";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import Meta from "@/components/utils/Meta";
import Spinner from "@/components/utils/Spinner";
import QueryKeys from "@/constants/queryKeys";
import { getAllCategories } from "@/lib/api/categories";
import { getPaginatedData } from "@/lib/api/data";
import { getAllProducts } from "@/lib/api/products";
import { queryStateToQueryString } from "@/lib/formater";
import { Category } from "@/types/Category";
import { Product } from "@/types/Product";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

const MAX_RECOMENDATION_PAGE = Number(
  process.env.NEXT_PUBLIC_MAX_RECOMENDATION_PAGE ?? 5
);

export default function Home({
  featuredProducts,
  latestProducts,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Meta />

      <section id="category" className="container pt-2 lg:pt-6 pb-6 lg:pb-12">
        <FeaturedProductsCarousel products={featuredProducts} />
      </section>

      <section
        id="category"
        className="container py-6 lg:py-12 space-y-3 lg:space-y-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <h2 className="text-2xl lg:text-4xl font-semibold">Kategori</h2>
          <Link href="/categories" className="text-primary">
            Lihat semua kategori
          </Link>
        </div>
        <CategoryList categories={categories} />
      </section>

      <section className="w-full flex flex-col lg:items-center lg:flex-row space-y-8 lg:space-y-10 pt-6 lg:pt-12 pb-12 lg:pb-24">
        <div className="relative w-5/6 lg:w-1/2 aspect-[4/3] bg-primary">
          <div className="absolute w-[95%] h-[95%] -right-[5%] -bottom-[5%]">
            <Image
              src="/images/banner-mall.jpg"
              alt=""
              fill
              loading="lazy"
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 h-full flex justify-center items-center">
          <div className="lg:px-20 space-y-3">
            <p className="text-lg text-center text-primary">Salesprint</p>
            <h3 className="text-center text-2xl lg:text-4xl font-bold leading-tight">
              Inovasi Terbaru dalam Pengalaman Belanja Online Anda!
            </h3>
          </div>
        </div>
      </section>

      <section
        id="latest-product"
        className="container py-6 lg:py-12 space-y-3 lg:space-y-6"
      >
        <h2 className="text-2xl lg:text-4xl font-semibold">Produk Terbaru</h2>
        <LatestProductsCarousel products={latestProducts} />
      </section>

      <section
        id="for-you"
        className="container py-6 lg:py-12 space-y-3 lg:space-y-6"
      >
        <h2 className="text-2xl lg:text-4xl font-semibold">
          Produk Rekomendasi
        </h2>
        <RecomendationSection />
      </section>
    </>
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

export const getStaticProps = (async () => {
  const [featuredProducts, latestProducts, categories] = await Promise.all([
    getAllProducts({
      with: ["product_images", "store"],
      withCount: ["reviews"],
      orderBy: {
        field: "average_rating",
        value: "desc",
      },
      limit: 8,
    }),
    getAllProducts({
      with: ["product_images", "store"],
      withCount: ["reviews"],
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      limit: 8,
    }),
    getAllCategories({ limit: 6 }),
  ]);

  return {
    props: {
      featuredProducts: featuredProducts ?? [],
      latestProducts: latestProducts ?? [],
      categories: categories ?? [],
    },
    revalidate: 60,
  };
}) satisfies GetStaticProps<{
  featuredProducts: Product[];
  latestProducts: Product[];
  categories: Category[];
}>;
