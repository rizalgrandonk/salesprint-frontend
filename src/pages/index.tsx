import CategoryList from "@/components/home/CategoryList";
import FeaturedProductsCarousel from "@/components/home/FeaturedProductsCarousel";
import LatestProductsCarousel from "@/components/home/LatestProductsCarousel";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import Meta from "@/components/utils/Meta";
import { getAllCategories } from "@/lib/api/categories";
import { getAllProducts } from "@/lib/api/products";
import { Category } from "@/types/Category";
import { Product } from "@/types/Product";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaAngleDoubleRight } from "react-icons/fa";
import * as DummyData from "../../data";

export default function Home({
  products,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const featuredProducts = products
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 6);

  const latestProducts = products.length > 4 ? products.slice(0, 8) : products;

  if (!products || !categories) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Meta />
      <FeaturedProductsCarousel products={featuredProducts} />

      <div className="w-full py-16 flex flex-col justify-center items-center">
        <h1 className="text-5xl md:text-7xl text-center font-gray-100 uppercase tracking-widest mb-2">
          Salesprint
        </h1>
        <span className="block w-1/2 h-2 bg-primary"></span>
      </div>

      <div className="relative">
        <span className="block w-2/5 h-1/4 absolute right-0 top-0 bg-secondary" />
        <section
          id="category"
          className="container mx-auto px-6 lg:px-16 pt-10 pb-10"
        >
          <h2 className="text-3xl md:text-5xl w-1/2 mb-10 font-semibold tracking-wide uppercase">
            Categories
          </h2>
          <CategoryList categories={categories} />
        </section>
      </div>

      <section className="w-full flex flex-col md:items-center md:flex-row space-y-10 mt-12 mb-12">
        <div className="relative w-5/6 md:w-1/2 h-100 bg-secondary">
          <div className="absolute w-[95%] h-[95%] -right-12 -bottom-12">
            <Image
              src="https://source.unsplash.com/random/?mall"
              alt=""
              fill
              loading="lazy"
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full flex justify-center items-center">
          <div className="w-full md:w-1/2">
            <p className="text-sm text-center my-6">Salesprint</p>
            <h3 className="text-center text-6xl font-bold my-4">
              Try Salesprint
            </h3>
            <Link
              href="/products"
              className="flex items-center justify-center my-10 text-2xl space-x-2 text-primary hover:text-gray-900"
            >
              <span className="text-lg underline hover:text-gray-900">
                All Products
              </span>
              <FaAngleDoubleRight />
            </Link>
          </div>
        </div>
      </section>

      <div className="relative">
        <span className="block w-1/5 h-2/4 absolute -right-0 top-0 md:top-16 bg-secondary" />
        <section
          id="latest-product"
          className="container mx-auto px-6 lg:px-16 pt-16 md:pt-24 pb-10"
        >
          <h2 className="text-3xl md:text-5xl w-1/2 mb-10 font-semibold tracking-wide uppercase">
            Latest Products
          </h2>
          <LatestProductsCarousel products={latestProducts} />
        </section>
      </div>
    </>
  );
}

export const getStaticProps = (async () => {
  const products = (await getAllProducts()) || [];
  const categories = (await getAllCategories()) || [];

  return {
    props: {
      products,
      categories,
    },
    revalidate: 20,
  };
}) satisfies GetStaticProps<{
  products: Product[];
  categories: Category[];
}>;
