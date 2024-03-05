import ProductCard from "@/components/ProductCard";
import { Button, ButtonLink } from "@/components/utils/Button";
import Meta from "@/components/utils/Meta";
import Spinner from "@/components/utils/Spinner";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import { DEFAULT_STORE_IMAGE } from "@/lib/constants";
import { generatePaginationArray } from "@/lib/formater";
import { Product } from "@/types/Product";
import { Store } from "@/types/Store";
import { MakePropertiesRequired } from "@/types/data";
import { Tab } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { MdChevronLeft, MdChevronRight, MdLocationPin } from "react-icons/md";
import { RiStarFill } from "react-icons/ri";
import { useInView } from "react-intersection-observer";
import { twMerge } from "tailwind-merge";

const TABS = [
  { title: "Produk", Component: ProductSection },
  { title: "Toko", Component: StoreSection },
];

export default function SearchPage() {
  const router = useRouter();
  const keywordQuery = router.query.keyword?.toString();

  return (
    <>
      <Meta
        title={`Jual ${keywordQuery} | Salesprint`}
        keywords={`${keywordQuery}`}
      />

      <div className="container py-4 lg:py-8 space-y-8">
        <div>
          <Tab.Group>
            <Tab.List className="flex items-end border-b border-gray-400 dark:border-gray-500">
              {TABS.map((tab, index) => (
                <Tab
                  key={index}
                  className={({ selected }) =>
                    twMerge(
                      "outline-none px-8 py-3 text-gray-500 dark:text-gray-400 font-semibold border-b-2 border-transparent",
                      selected
                        ? "border-primary dark:border-primary text-primary dark:text-primary"
                        : ""
                    )
                  }
                >
                  {tab.title}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {TABS.map(({ Component }, index) => (
                <Tab.Panel key={index} className="py-6">
                  <Component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </>
  );
}

function ProductSection() {
  const path = `/paginated/products`;

  const { ref, inView } = useInView();
  const router = useRouter();
  const keywordQuery = router.query.keyword?.toString();

  const {
    data: products,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setPage,
    setSearchKey,
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
      search: { field: "name", value: keywordQuery ?? "" },
      limit: 12,
      with: ["product_images", "category", "store"],
      withCount: ["reviews", "order_items"],
    },
    {
      queryKey: [path + "/search", keywordQuery],
      enabled: inView && !!keywordQuery,
    }
  );

  useEffect(() => {
    if (keywordQuery) {
      setSearchKey({ field: "name", value: keywordQuery });
    }
  }, [keywordQuery]);

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
      ) : !products || products.length <= 0 ? (
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

function StoreSection() {
  const path = `/paginated/stores`;

  const { ref, inView } = useInView();
  const router = useRouter();
  const keywordQuery = router.query.keyword?.toString();

  const {
    data: stores,
    summaryData,
    isLoading,
    queryState,
    nextPage,
    previousPage,
    setPage,
    setFilter,
    setSearchKey,
    refetch,
    isFetching,
  } = useDataTable<
    MakePropertiesRequired<Store, "reviews_avg_rating" | "reviews_count">
  >(
    path,
    {
      orderBy: {
        field: "name",
        value: "asc",
      },
      search: { field: "name", value: keywordQuery ?? "" },
      limit: 12,
      withCount: ["reviews"],
      withAvgs: [
        {
          relation: "reviews",
          field: "rating",
        },
      ],
    },
    {
      queryKey: [path + "/search", keywordQuery],
      enabled: inView && !!keywordQuery,
    }
  );

  useEffect(() => {
    if (keywordQuery) {
      setSearchKey({ field: "name", value: keywordQuery });
    }
  }, [keywordQuery]);

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
      ) : !stores || stores.length <= 0 ? (
        <div>Belum ada toko</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stores.map((store, i) => (
            <Link
              key={store.id}
              href={`/${store.slug}`}
              className="w-full h-full shadow-md rounded overflow-hidden group border border-gray-200 dark:border-gray-700 px-2 py-2 space-y-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 aspect-square relative rounded-full">
                  <Image
                    src={store.image || DEFAULT_STORE_IMAGE}
                    alt={store.name || ""}
                    fill
                    sizes="2rem"
                    loading="lazy"
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="flex-grow space-y-1.5">
                  <p className="leading-none text-sm font-semibold line-clamp-2">
                    {store.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MdLocationPin className="text-sm" />
                    <p className="leading-none">{store.city}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex item-center gap-1 text-sm">
                    <RiStarFill className="text-yellow-500" />
                    <p className="leading-none">
                      {store.reviews_avg_rating.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5 items-end text-xs text-gray-500 dark:text-gray-400">
                    <p className="leading-none">{store.reviews_count}</p>
                    <p className="leading-none">Ulasan</p>
                  </div>
                </div>
              </div>

              <ButtonLink
                href={`/${store.slug}`}
                variant="primary"
                outline
                size="sm"
                className="w-full"
              >
                Kunjungi Toko
              </ButtonLink>
            </Link>
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
