import ProductForm, { ProductData } from "@/components/dashboard/ProductForm";
import Alerts from "@/components/utils/Alerts";
import Breadcrumb from "@/components/utils/Breadcrumb";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import {
  createProductImages,
  getProduct,
  updateProduct,
} from "@/lib/api/products";
import { getUserStore } from "@/lib/api/stores";
import { slugify } from "@/lib/formater";
import toast from "@/lib/toast";
import { VariantCombination, VariantType } from "@/types/Product";
import { ProductVariant } from "@/types/Variant";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { RiInformationLine } from "react-icons/ri";

export default function EditProductPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const router = useRouter();
  const productSlug = router.query.slug?.toString();

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const storeSlug = store?.slug;

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: [QueryKeys.PRODUCTS, productSlug],
    queryFn: () =>
      !!storeSlug && !!productSlug
        ? getProduct(storeSlug, productSlug, {
            with: [
              "category",
              "store_category",
              "store",
              "product_images",
              "product_variants.variant_options.variant_type",
            ],
          })
        : null,
    enabled: !!storeSlug && !!productSlug,
  });

  const queryClient = useQueryClient();

  const [isLoadingRequest, setIsLoadingRequest] = useState(false);

  if (isLoadingStore || isLoadingProduct) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!store) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }
  if (!product) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Product data not found
      </Alerts>
    );
  }

  const { variants, variant_combinations } = transformProductVariants(
    product?.product_variants
  );
  const main_image = product.product_images?.find((img) => !!img.main_image)
    ?.image_url!;
  const images = product.product_images
    ?.filter((img) => !img.main_image)
    .map((img) => img.image_url)!;

  const defaultValue: ProductData = {
    name: product.name,
    category_id: product.category_id,
    store_category_id: product.store_category_id,
    description: product.description,
    height: product.height,
    length: product.length,
    weight: product.weight,
    width: product.width,
    images: images,
    main_image: main_image,
    variants: variants,
    variant_combinations: variant_combinations,
  };

  const handleSubmit = async (formData: ProductData) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    if (!store) {
      toast.error("Data toko tidak ditemukan");
      return;
    }

    if (!product) {
      toast.error("Data produk tidak ditemukan");
      return;
    }

    const { images, main_image, ...data } = formData;

    const imageFormData = new FormData();
    imageFormData.append("main_image", main_image);
    images.forEach((image) => {
      imageFormData.append("images[]", image);
    });

    const productSlug = slugify(data.name);
    const createResult = await updateProduct(
      {
        ...data,
        slug: productSlug,
        slug_with_store: `${store.slug}/${productSlug}`,
      },
      store.slug,
      product.slug,
      userToken
    );
    if (!createResult.success) {
      toast.error(createResult.message ?? "Failed create product");
      return;
    }

    const createImageResult = await createProductImages(
      store.slug,
      createResult.data.slug,
      imageFormData,
      userToken
    );
    if (!createImageResult.success) {
      toast.error(createImageResult.message ?? "Failed create product images");
      return;
    }

    toast.success("Success update product");
    queryClient.invalidateQueries({
      queryKey: [`/paginated/stores/${store.slug}/products/`],
    });
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PRODUCTS, product.slug],
    });
    return router.push("/seller/products");
  };

  return (
    <div className="px-3 lg:px-5 pt-1 pb-6 space-y-2 lg:space-y-4">
      <div className="space-y-2">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/seller",
            },
            {
              title: "Produk",
              href: "/seller/products",
            },
            {
              title: "Edit Produk",
              href: `/seller/products/${productSlug}`,
            },
          ]}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Atur Produk
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-4">
        <ProductForm
          className="col-span-full lg:col-span-3"
          productSlug={product.slug}
          storeSlug={store.slug}
          defaultData={defaultValue}
          onSubmit={async (formData) => {
            setIsLoadingRequest(true);
            await handleSubmit(formData);
            setIsLoadingRequest(false);
          }}
          isLoadingRequest={isLoadingRequest}
        />
      </div>
    </div>
  );
}

function transformProductVariants(productVariants?: ProductVariant[]) {
  const variants: VariantType[] = [];
  const variant_combinations: VariantCombination[] = [];

  if (!productVariants) {
    return {
      variants: variants,
      variant_combinations: variant_combinations,
    };
  }

  const variantTypesMap = new Map<string, VariantType>();

  productVariants.forEach((product) => {
    product.variant_options?.forEach((option) => {
      if (!variantTypesMap.has(option.variant_type_id)) {
        variantTypesMap.set(option.variant_type_id, {
          variant_type: option.variant_type?.name ?? "",
          variant_options: [],
        });
      }

      const variantType = variantTypesMap.get(option.variant_type_id);
      if (variantType && !variantType.variant_options.includes(option.value)) {
        variantType.variant_options.push(option.value);
      }
    });

    const comb: VariantCombination = {
      price: product.price.toString(),
      stok: product.stok.toString(),
      sku: product.sku,
    };

    product.variant_options?.forEach((option) => {
      const variantType = variantTypesMap.get(option.variant_type_id);
      if (variantType) {
        comb[variantType.variant_type] = option.value;
      }
    });

    variant_combinations.push(comb);
  });

  variants.push(...Array.from(variantTypesMap.values()));

  return {
    variants: variants,
    variant_combinations: variant_combinations,
  };
}
