import Image from "next/image";
import Link from "next/link";
// import { useCart } from "@/contexts/CartContext";
// import { getMediaURL } from "@/lib/api";
import { formatPrice } from "@/lib/formater";
import { Product } from "@/types/Product";
import { useRouter } from "next/router";

type LatestProductsItemProps = {
  product: Product;
  slide: number;
  currentSlide: number;
};

const LatestProductsItem = ({
  product,
  slide,
  currentSlide,
}: LatestProductsItemProps) => {
  const { locale } = useRouter();
  // const { addItem, inCart } = useCart();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block w-full h-[70vh] px-1 lg:px-3"
    >
      <div className="relative w-full h-full shadow-md overflow-hidden group">
        <div className="w-full h-full transition-all duration-500 transform group-hover:scale-125 bg-cover bg-center relative">
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
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/50 transition-all duration-500">
          <div className="absolute bottom-0 left-0 w-full">
            <div className="w-full p-4 text-white">
              <h2 className="text-3xl mb-3 uppercase font-semibold">
                {product.name}
              </h2>
              <span className="px-3 py-1 font-medium rounded-full border-2 border-primary">
                {`Price | ${formatPrice(product.price)}`}
              </span>
              <span className="block mt-6 hover:text-primary">
                Click for detail{" >>"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LatestProductsItem;
