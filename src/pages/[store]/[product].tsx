import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import Meta from "@/components/utils/Meta";
import ProductRating from "@/components/utils/ProductRating";
import QueryKeys from "@/constants/queryKeys";
import { getProduct } from "@/lib/api/products";
import { DEFAULT_STORE_CATEGORY_IMAGE } from "@/lib/constants";
import { formatPrice, htmlToPlainText } from "@/lib/formater";
import { Product, VariantCombination } from "@/types/Product";
import { ProductVariant, VariantOption, VariantType } from "@/types/Variant";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { MdShoppingCart } from "react-icons/md";

export const getServerSideProps = (async (ctx) => {
  const storeSlug = ctx.query.store?.toString();
  const productSlug = ctx.query.product?.toString();

  const product =
    storeSlug && productSlug
      ? await getProduct(storeSlug, productSlug, {
          with: [
            "product_images",
            "product_variants.variant_options.variant_type",
            "category",
            "store",
          ],
          withCount: ["reviews", "order_items"],
        })
      : null;

  return { props: { product } };
}) satisfies GetServerSideProps<{ product: Product | null }>;

export default function ProductPage({
  product,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!product) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-4xl">
        Halaman Tidak ditemukan
      </div>
    );
  }

  const { variantsTypeOptions, variantCombinations } = transformProductVariants(
    product.product_variants
  );

  return (
    <>
      <Meta
        title={`Jual ${product.name} | Salesprint`}
        description={htmlToPlainText(product.description)}
        keywords={product.category?.name}
        shareImage={
          product.product_images?.find((image) => image.main_image)
            ?.image_url ||
          product.product_images?.[0]?.image_url ||
          DEFAULT_STORE_CATEGORY_IMAGE
        }
      />

      <div className="py-8">
        <section className="container p-4 flex flex-col lg:flex-row lg:gap-2 rounded-sm">
          <div className="w-full lg:w-1/2 flex flex-col lg:flex-row-reverse gap-2">
            <div className="relative w-full lg:w-5/6 aspect-square bg-white dark:bg-gray-800 rounded-sm overflow-hidden">
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
                className="object-contain"
                sizes="50vw"
              />
            </div>
            <div className="w-full lg:w-1/6 flex lg:flex-col items-center gap-2">
              {product.product_images &&
                product.product_images.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-40 lg:w-full lg:h-auto aspect-square bg-white dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary hover:dark:border-primary"
                  >
                    <Image
                      src={image.image_url}
                      alt={product.name}
                      fill
                      loading="lazy"
                      className="object-contain"
                      sizes="20vw"
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-3 py-6 lg:py-2 lg:pl-12">
            <h1 className="text-2xl font-medium">{product.name}</h1>
            <div className="flex items-center divide-x divide-gray-500">
              <div className="flex items-center gap-1 pr-4">
                <span className="font-semibold">{product.average_rating}</span>
                <ProductRating
                  className="text-base"
                  rating={product.average_rating}
                />
              </div>
              <div className="flex items-center gap-1 px-4">
                <span className="font-semibold">{product.reviews_count}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Reviews
                </span>
              </div>
              <div className="flex items-center gap-1 pl-4">
                <span className="font-semibold">
                  {product.order_items_count}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Terjual
                </span>
              </div>
            </div>
            <h2 className="text-5xl text-primary font-semibold">
              {formatPrice(product.price)}
            </h2>

            <div className="py-8 space-y-5">
              {variantsTypeOptions.map((variantsTypeOption) => (
                <div
                  key={variantsTypeOption.variant_type.id}
                  className="flex items-start"
                >
                  <div className="w-1/5">
                    <span className="text-gray-500 dark:text-gray-400">
                      {variantsTypeOption.variant_type.name}
                    </span>
                  </div>
                  <div className="w-4/5 flex items-center flex-wrap gap-2">
                    {variantsTypeOption.variant_options.map((option) => (
                      <Button key={option.id} variant="base" outline>
                        {option.value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-start">
                <div className="w-1/5">
                  <span className="text-gray-500 dark:text-gray-400">
                    Kuantitas
                  </span>
                </div>
                <div className="w-4/5 flex items-center flex-wrap">
                  <Button className="rounded-r-none" variant="base" outline>
                    -
                  </Button>
                  <FormInput
                    id="quantity"
                    className="w-16 text-sm h-9 rounded-none text-center"
                    defaultValue="1"
                  />
                  <Button className="rounded-l-none" variant="base" outline>
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" className="text-lg h-12">
              <MdShoppingCart className="text-2xl" />
              Masukan Keranjang
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function transformProductVariants(productVariants?: ProductVariant[]) {
  const variantsTypeOptions: {
    variant_type: VariantType;
    variant_options: VariantOption[];
  }[] = [];
  const variantCombinations: VariantCombination[] = [];

  if (!productVariants) {
    return {
      variantsTypeOptions: variantsTypeOptions,
      variantCombinations: variantCombinations,
    };
  }

  const variantsTypeOptionMap = new Map<
    string,
    {
      variant_type: VariantType;
      variant_options: VariantOption[];
    }
  >();

  productVariants.forEach((product) => {
    product.variant_options?.forEach((option) => {
      if (
        !variantsTypeOptionMap.has(option.variant_type_id) &&
        option.variant_type
      ) {
        variantsTypeOptionMap.set(option.variant_type_id, {
          variant_type: option.variant_type,
          variant_options: [],
        });
      }

      const variantsTypeOption = variantsTypeOptionMap.get(
        option.variant_type_id
      );
      if (
        variantsTypeOption &&
        !variantsTypeOption.variant_options.some((opt) => opt.id === option.id)
      ) {
        variantsTypeOption.variant_options.push(option);
      }
    });

    const comb: VariantCombination = {
      price: product.price.toString(),
      stok: product.stok.toString(),
      sku: product.sku,
    };

    product.variant_options?.forEach((option) => {
      const variantsTypeOption = variantsTypeOptionMap.get(
        option.variant_type_id
      );
      if (variantsTypeOption) {
        comb[variantsTypeOption.variant_type.name] = option.value;
      }
    });

    variantCombinations.push(comb);
  });

  variantsTypeOptions.push(...Array.from(variantsTypeOptionMap.values()));

  return {
    variantsTypeOptions: variantsTypeOptions,
    variantCombinations: variantCombinations,
  };
}
