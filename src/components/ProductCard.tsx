import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice } from "@/lib/formater";
import { Product } from "@/types/Product";
import Image from "next/image";
import Link from "next/link";
import { AnchorHTMLAttributes, forwardRef } from "react";
import { RiStoreLine } from "react-icons/ri";
import ProductRating from "./utils/ProductRating";

type ProductCardProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  product: Product;
};

export const ProductCard = forwardRef<HTMLAnchorElement, ProductCardProps>(
  function ProductCard({ product }, ref) {
    return (
      <Link
        ref={ref}
        href={`/${product.store?.slug}/${product.slug}`}
        className="w-full h-full shadow-md rounded overflow-hidden group border border-gray-200 dark:border-gray-700 p-1.5"
      >
        <div className="w-full aspect-square bg-cover bg-center relative rounded overflow-hidden">
          <Image
            src={
              product.product_images?.find((image) => image.main_image)
                ?.image_url ||
              product.product_images?.[0]?.image_url ||
              DEFAULT_STORE_CATEGORY_IMAGE
            }
            alt={product.name}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-all duration-200"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        <div className="px-2 py-4 space-y-3">
          <h3 className="line-clamp-2 m-0 leading-tight">{product.name}</h3>

          <div className="flex items-center gap-2">
            <ProductRating
              className="text-xs"
              rating={product.average_rating}
            />
            <span className="px-1 py-0.5 leading-none text-xs font-semibold bg-primary-light text-primary-dark rounded">
              {product.average_rating.toFixed(1)}
            </span>
          </div>

          {!!product.store && (
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <RiStoreLine />
              <div className="h-5 w-full overflow-y-hidden relative text-sm">
                <div className="absolute left-0 top-0 group-hover:-top-[1.2rem] lg:group-hover:-top-[1.2rem] transition-all duration-300">
                  <p className="block font-medium leading-tight line-clamp-1">
                    {product.store.city.length > 15
                      ? product.store.city.slice(0, 15) + "..."
                      : product.store.city}
                  </p>
                  <p className="block font-medium leading-tight line-clamp-1">
                    {product.store.name.length > 15
                      ? product.store.name.slice(0, 15) + "..."
                      : product.store.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="font-semibold text-lg leading-none">
            {`${formatPrice(product.price)}`}
          </p>
        </div>
      </Link>
    );
  }
);

export default ProductCard;
