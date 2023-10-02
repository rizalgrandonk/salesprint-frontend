import Image from "next/image";
import Link from "next/link";
// import { useCart } from "@/contexts/CartContext";
// import { getMediaURL } from "@/lib/api";
import { formatPrice } from "@/lib/formater";
import { Product } from "@/types/Product";
import { useRouter } from "next/router";

type FeaturedProductsItemProps = {
  product: Product;
};

const FeaturedProductsItem = ({ product }: FeaturedProductsItemProps) => {
  const { locale } = useRouter();
  // const { addItem, inCart } = useCart();

  return (
    <div className="w-full h-screen relative block m-auto">
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
        <div className="text-white z-10 p-6 md:p-0 md:pl-20 w-full md:w-7/12">
          <h3 className="text-5xl uppercase font-bold">{product.name}</h3>
          <p className="my-4 text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <p className="hidden md:block my-4">{product.description}</p>
          <button
            className="inline-block mr-4 px-5 py-3 bg-primary hover:bg-opacity-80 font-semibold tracking-wider disabled:bg-gray-400 disabled:pointer-events-none uppercase mb-3"
            // onClick={() => addItem(product)}
            // disabled={inCart(product.id)}
          >
            Add To Cart
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="inline-block px-5 py-3 bg-secondary hover:bg-opacity-80 font-semibold tracking-wider uppercase"
          >
            Discover
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductsItem;
