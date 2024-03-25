import Meta from "@/components/utils/Meta";
import { getAllCategories } from "@/lib/api/categories";
import { Category } from "@/types/Category";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";

export const getServerSideProps = (async () => {
  const categories = await getAllCategories({ withCount: ["products"] });

  if (!categories) {
    return {
      notFound: true,
    };
  }

  return { props: { categories } };
}) satisfies GetServerSideProps<{
  categories: Category[];
}>;

export default function CategoriesPage({
  categories,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Meta title={`Kategori | Salesprint`} />

      <div className="container py-8 space-y-8">
        <section className="w-full h-[50vh] relative rounded overflow-hidden block transition-all duration-500 transform group bg-cover bg-center">
          <Image
            src="https://source.unsplash.com/random/?mall"
            alt="Kategori"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover object-center group-hover:scale-110 transition-all duration-500"
          />
          <div className="relative w-full h-full flex justify-center items-center bg-black/70">
            <h1 className="text-3xl lg:text-5xl text-white text-center uppercase font-semibold">
              Daftar Kategori
            </h1>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center gap-4 rounded-sm group"
            >
              <div className="h-32 aspect-square relative rounded-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="50vw"
                  loading="lazy"
                  className="object-cover object-center group-hover:scale-110 transition-all duration-500"
                />
              </div>

              <h2 className="text-lg leading-none text-center">
                {category.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-none text-center">
                {`${category.products_count} produk`}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
