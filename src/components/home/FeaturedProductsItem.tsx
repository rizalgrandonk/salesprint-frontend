import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice, htmlToPlainText } from "@/lib/formater";
import { Product } from "@/types/Product";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiStarFill, RiStoreLine } from "react-icons/ri";

type FeaturedProductsItemProps = {
  product: Product;
};

const FeaturedProductsItem = ({ product }: FeaturedProductsItemProps) => {
  const { locale } = useRouter();
  // const { addItem, inCart } = useCart();

  return (
    <Link
      href={`/${product.store?.slug}/${product.slug}`}
      className="w-full h-[30vh] lg:h-[50vh] relative block m-auto rounded overflow-hidden group"
    >
      <Image
        src={
          product.product_images?.find((image) => image.main_image)
            ?.image_url ||
          product.product_images?.[0]?.image_url ||
          DEFAULT_STORE_CATEGORY_IMAGE
        }
        alt={product.name}
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover object-center"
      />
      <div className="relative w-full h-full flex items-center bg-black/60">
        <div className="text-white z-10 p-4 lg:p-0 lg:pl-20 w-full lg:w-7/12 space-y-2 lg:space-y-4">
          <h3 className="leading-tight text-xl lg:text-5xl font-bold line-clamp-2">
            {product.name}
          </h3>
          <p className="leading-tight text-lg lg:text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <div className="flex flex-col lg:flex-row gap-1 lg:gap-0 lg:items-center lg:divide-x">
            <div className="flex items-center gap-0.5 lg:gap-2 lg:pr-3">
              <RiStarFill className="text-base lg:text-xl text-yellow-500 leading-none" />
              <p className="text-sm lg:text-lg font-medium leading-none">
                {product.average_rating}
                <span className="text-gray-200 font-light">{` (${
                  product.reviews_count || 0
                } reviews)`}</span>
              </p>
            </div>

            {!!product.store && (
              <div className="flex flex-grow items-center gap-0.5 lg:gap-2 lg:pl-3">
                <RiStoreLine className="text-base lg:text-xl" />
                <div className="h-5 lg:h-7 w-full overflow-y-hidden relative">
                  <div className="absolute left-0 top-0 group-hover:-top-5 lg:group-hover:-top-7 transition-all duration-300 space-y-0">
                    <span className="block text-sm lg:text-lg font-medium">
                      {product.store.city}
                    </span>
                    <span className="block text-sm lg:text-lg font-medium">
                      {product.store.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="hidden lg:line-clamp-2">
            {htmlToPlainText(product.description)}
          </p>
          <button className="inline-block text-sm lg:text-base px-4 lg:px-5 py-2 lg:py-3 bg-primary hover:bg-opacity-80 font-semibold tracking-wider uppercase">
            Telusuri
          </button>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedProductsItem;
