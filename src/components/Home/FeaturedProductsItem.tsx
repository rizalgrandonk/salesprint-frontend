import Image from "next/image";
import Link from "next/link";
// import { useCart } from "@/contexts/CartContext";
// import { getMediaURL } from "@/lib/api";
import { formatPrice } from "@/lib/formater";
import { Product } from "@/types/Product";
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
      href={`/products/${product.slug}`}
      className="w-full h-[50vh] relative block m-auto rounded overflow-hidden group"
    >
      <Image
        src={
          product.product_images.find((image) => image.main_image)?.image_url ||
          product.product_images[0].image_url ||
          ""
        }
        alt={product.name}
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover object-center"
      />
      <div className="relative w-full h-full flex items-center bg-black/60">
        <div className="text-white z-10 p-6 lg:p-0 lg:pl-20 w-full lg:w-7/12 space-y-4">
          <h3 className="text-5xl font-bold line-clamp-2">{product.name}</h3>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 lg:items-center lg:divide-x">
            <div className="flex items-end gap-2 lg:pr-3">
              <RiStarFill className="text-xl text-yellow-500" />
              <p className="text-lg font-medium leading-none">
                {product.average_rating}
                <span className="text-gray-200 font-light">{` (${
                  product.reviews_count || 0
                } reviews)`}</span>
              </p>
            </div>

            {!!product.store && (
              <div className="flex flex-grow items-center gap-2 lg:pl-3">
                <RiStoreLine className="text-xl" />
                <div className="h-5 w-full overflow-y-hidden relative">
                  <div className="absolute left-0 top-0 group-hover:-top-[1.45rem] transition-all duration-300 space-y-1">
                    <span className="block text-lg font-medium leading-none">
                      {product.store.city}
                    </span>
                    <span className="block text-lg font-medium leading-none">
                      {product.store.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="hidden lg:line-clamp-2">{product.description}</p>
          <button className="inline-block px-5 py-3 bg-primary hover:bg-opacity-80 font-semibold tracking-wider uppercase">
            Discover
          </button>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedProductsItem;
