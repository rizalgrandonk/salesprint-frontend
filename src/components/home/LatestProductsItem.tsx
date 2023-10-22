import Image from "next/image";
import Link from "next/link";
// import { useCart } from "@/contexts/CartContext";
// import { getMediaURL } from "@/lib/api";
import { formatPrice } from "@/lib/formater";
import { Product } from "@/types/Product";
import { useRouter } from "next/router";
import { RiStarFill, RiStoreLine } from "react-icons/ri";

type LatestProductsItemProps = {
  product: Product;
};

const LatestProductsItem = ({ product }: LatestProductsItemProps) => {
  const { locale } = useRouter();
  // const { addItem, inCart } = useCart();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block w-full h-80 p-1 lg:p-3"
    >
      <div className="px-3 py-4 flex w-full h-full shadow-md rounded overflow-hidden group border border-gray-200 dark:border-gray-700">
        <div className="w-40 lg:w-80 h-full bg-cover bg-center relative rounded overflow-hidden">
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
        <div className="flex-grow max-w-[12rem] lg:max-w-sm px-4 py-2 space-y-4">
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-0 lg:items-center lg:divide-x divide-gray-400 text-sm">
            <div className="flex items-end gap-2 lg:pr-3">
              <RiStarFill className="text-yellow-500 text-base" />
              <p className="font-medium leading-none">
                {product.average_rating}
                <span className="text-gray-400 font-light">{` (${
                  product.reviews_count || 0
                } reviews)`}</span>
              </p>
            </div>

            {!!product.store && (
              <div className="flex flex-grow items-center gap-2 lg:pl-3">
                <RiStoreLine className="text-base" />
                <div className="h-4 w-full overflow-y-hidden relative">
                  <div className="absolute left-0 top-0 group-hover:-top-[1.1rem] transition-all duration-300 space-y-1">
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
          </div>
          <h2 className="text-xl lg:text-2xl font-semibold line-clamp-2">
            {product.name}
          </h2>
          <p className="hidden lg:line-clamp-4 text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
          <span className="inline-block px-3 py-0.5 lg:text-lg font-semibold rounded-full border-2 border-primary">
            {`${formatPrice(product.price)}`}
          </span>
          {/* <span className="block hover:text-primary">
            Click for detail{" >>"}
          </span> */}
        </div>
      </div>
    </Link>
  );
};

export default LatestProductsItem;
