import ProductForm, { ProductData } from "@/components/dashboard/ProductForm";
import Alerts from "@/components/utils/Alerts";
import Breadcrumb from "@/components/utils/Breadcrumb";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import { createProduct, createProductImages } from "@/lib/api/products";
import { getUserStore } from "@/lib/api/stores";
import { slugify } from "@/lib/formater";
import toast from "@/lib/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaRegCaretSquareDown } from "react-icons/fa";
import { RiInformationLine } from "react-icons/ri";

export default function CreateProductPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const [isLoadingRequest, setIsLoadingRequest] = useState(false);

  if (isLoadingStore) {
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

  const handleSubmit = async (formData: ProductData) => {
    if (!userToken) {
      toast.error("Unauthorize");
      return;
    }

    if (!store) {
      toast.error("Data toko tidak ditemukan");
      return;
    }

    const { images, main_image, ...data } = formData;

    const imageFormData = new FormData();
    imageFormData.append("main_image", main_image);
    images.forEach((image) => {
      imageFormData.append("images[]", image);
    });

    const productSlug = slugify(data.name);
    const createResult = await createProduct(
      {
        ...data,
        slug: productSlug,
        slug_with_store: `${store.slug}/${productSlug}`,
      },
      store.slug,
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

    toast.success("Success creating product");
    queryClient.invalidateQueries({
      queryKey: [`/paginated/stores/${store.slug}/products/`],
    });
    return router.push("/seller/products");
  };

  return (
    <div className="px-3 lg:px-5 pt-1 pb-6 space-y-2 lg:space-y-4">
      <div className="space-y-3">
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
              title: "Tambah Produk",
              href: "/seller/products/create",
            },
          ]}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Buat Produk Baru
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-4">
        <ProductForm
          className="col-span-full lg:col-span-3"
          storeSlug={store.slug}
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
