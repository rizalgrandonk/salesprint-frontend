import { formatPrice } from "@/lib/formater";
import { Product } from "@/types/Product";
import Image from "next/image";
import Link from "next/link";
import { RiStoreLine } from "react-icons/ri";
import ProductRating from "./utils/ProductRating";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={product.slug}
      className="w-full h-full shadow-md rounded overflow-hidden group border border-gray-300 dark:border-gray-600 p-2"
    >
      <div className="w-full h-36 lg:h-60 bg-cover bg-center relative rounded overflow-hidden">
        <Image
          src={
            product.product_images.find((image) => image.main_image)
              ?.image_url ||
            product.product_images[0].image_url ||
            ""
          }
          alt={product.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-all duration-200"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      <div className="px-2 py-4 space-y-3">
        <h3 className="text-lg lg:text-2xl line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2">
          <ProductRating className="text-sm" rating={product.average_rating} />
          <span className="px-2 py-0.5 text-xs font-semibold bg-primary-light text-primary-dark rounded">
            {product.average_rating}
          </span>
        </div>

        {!!product.store && (
          <div className="flex items-center gap-2">
            <RiStoreLine className="lg:text-lg" />
            <div className="h-3 lg:h-4 w-full overflow-y-hidden relative text-sm lg:text-base">
              <div className="absolute left-0 top-0 group-hover:-top-[1.2rem] lg:group-hover:-top-[1.3rem] transition-all duration-300 space-y-1">
                <span className="block font-medium leading-none">
                  {product.store.city}
                </span>
                <span className="block font-medium leading-none">
                  {product.store.name}
                </span>
              </div>
            </div>
          </div>
        )}

        <p className="font-bold lg:text-xl">
          {`${formatPrice(product.price)}`}
        </p>
      </div>
    </Link>
  );
}
