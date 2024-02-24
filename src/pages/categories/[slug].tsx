import ProductCard from "@/components/ProductCard";
import StoreBannersCarousel from "@/components/home/StoreBannersCarousel";
import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import Meta from "@/components/utils/Meta";
import Spinner from "@/components/utils/Spinner";
import useDataTable from "@/hooks/useDataTable";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getStoreProducts } from "@/lib/api/products";
import { getStoreBySlug } from "@/lib/api/stores";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { generatePaginationArray } from "@/lib/formater";
import { Category } from "@/types/Category";
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
  const categorySlug = ctx.query.slug?.toString();

  const [category] = await Promise.all([
    categorySlug ? getCategoryBySlug(categorySlug) : null,
  ]);

  if (!category) {
    return {
      notFound: true,
    };
  }

  return { props: { category } };
}) satisfies GetServerSideProps<{
  category: Category;
}>;

export default function CategoryPage({
  category,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <>
      <Meta
        title={`${category.name} | Salesprint`}
        keywords={`${category.name}`}
        shareImage={category.image || DEFAULT_STORE_CATEGORY_IMAGE}
      />
      <div className="container py-8 space-y-8">
        <section className="w-full h-[50vh] relative rounded overflow-hidden block transition-all duration-500 transform group bg-cover bg-center">
          <Image
            src={category.image || DEFAULT_STORE_CATEGORY_IMAGE}
            alt={category.name}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover object-center group-hover:scale-110 transition-all duration-500"
          />
          <div className="relative w-full h-full flex justify-center items-center bg-black/50">
            <h2 className="text-3xl lg:text-5xl text-white text-center uppercase font-semibold">
              {category.name}
            </h2>
          </div>
        </section>

        <ProductSection categorySlug={category.slug} />
      </div>
    </>
  );
}
type ProductSectionProps = {
  categorySlug: string;
};
function ProductSection({ categorySlug }: ProductSectionProps) {
  const path = `/paginated/categories/${categorySlug}/products`;

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
