import { Category } from "@/types/Category";
import Image from "next/image";
import Link from "next/link";
// import { getMediaURL } from "@/lib/api";

type CategoriesItemProps = {
  category: Category;
  index: number;
};

export default function CategoriesItem({
  category,
  index,
}: CategoriesItemProps) {
  let span = "";
  switch (index) {
    case 0:
      span = "lg:row-span-2";
      break;

    case 1:
      span = "lg:col-span-2";
      break;

    case 3:
      span = "lg:row-span-2";
      break;

    default:
      span = "";
      break;
  }

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`relative block w-full lg:h-full transition-all duration-500 transform hover:scale-95 bg-cover bg-center ${span}`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="absolute w-full h-full object-cover object-center"
      />
      <div className="relative w-full h-full flex justify-center items-center bg-black/50">
        <h2 className="text-3xl md:text-5xl text-white text-center uppercase font-semibold">
          {category.name}
        </h2>
      </div>
    </Link>
  );
}
