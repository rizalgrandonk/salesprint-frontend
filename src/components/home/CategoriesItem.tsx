import { Category } from "@/types/Category";
import Image from "next/image";
import Link from "next/link";

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
      className={`relative block w-full lg:h-full transition-all duration-500 transform hover:scale-95 group bg-cover bg-center overflow-hidden rounded ${span}`}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 100vw, 66vw"
        loading="lazy"
        className="object-cover object-center group-hover:scale-110 transition-all duration-500"
      />
      <div className="relative w-full h-full flex justify-center items-center bg-black/50">
        <h2 className="text-3xl lg:text-5xl text-white text-center uppercase font-semibold">
          {category.name}
        </h2>
      </div>
    </Link>
  );
}
