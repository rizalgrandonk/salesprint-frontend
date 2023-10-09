import ProductCard from "@/components/ProductCard";
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

export default function Home({
  products,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const featuredProducts = products
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 6);

  const latestProducts = products.length > 4 ? products.slice(0, 8) : products;

  const recomendations = products.sort(() => 0.5 - Math.random()).slice(0, 12);

  if (!products || !categories) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Meta />
      <section id="category" className="container pt-6 pb-12">
        <FeaturedProductsCarousel products={featuredProducts} />
      </section>

      <section id="category" className="container py-12 space-y-6">
        <div className="flex gap-4 items-end">
          <h2 className="text-2xl lg:text-4xl font-semibold">Categories</h2>
          <Link
            href="/categories"
            className="flex items-center justify-center text-2xl gap-2 text-primary hover:text-primary-dark"
          >
            <span className="text-xl font-semibold underline hover:text-primary-dark">
              See all categories
            </span>
            <FaAngleDoubleRight />
          </Link>
        </div>
        <CategoryList categories={categories} />
      </section>

      <section className="w-full flex flex-col lg:items-center lg:flex-row space-y-10 pt-12 pb-24">
        <div className="relative w-5/6 lg:w-1/2 h-100 bg-primary">
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
        <div className="w-full lg:w-1/2 h-full flex justify-center items-center">
          <div className="w-full lg:w-1/2">
            <p className="text-sm text-center my-6">Salesprint</p>
            <h3 className="text-center text-6xl font-bold my-4">
              Try Salesprint
            </h3>
            <Link
              href="/products"
              className="flex items-center justify-center my-10 text-2xl space-x-2 text-primary hover:text-primary-dark"
            >
              <span className="text-lg underline hover:text-primary-dark">
                See all Products
              </span>
              <FaAngleDoubleRight />
            </Link>
          </div>
        </div>
      </section>

      <section id="latest-product" className="container py-12 space-y-6">
        <h2 className="text-2xl lg:text-4xl font-semibold">Latest Products</h2>
        <LatestProductsCarousel products={latestProducts} />
      </section>

      <section id="for-you" className="container py-12 space-y-6">
        <h2 className="text-2xl lg:text-4xl font-semibold">For You</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[28rem] lg:auto-rows-[28rem] gap-6">
          {recomendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
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
