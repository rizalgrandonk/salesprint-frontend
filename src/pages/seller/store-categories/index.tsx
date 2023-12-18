import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { ButtonLink } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import { getStoreCategories } from "@/lib/api/storeCategories";
import { getUserStore } from "@/lib/api/stores";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import { MdAdd, MdOutlineStorefront } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";

export default function StoreCategories() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  const storeSlug = store?.slug;

  const { data: storeCategories, isLoading: isLoadingStoreCategories } =
    useQuery({
      queryKey: [QueryKeys.STORE_CATEGORIES, storeSlug],
      queryFn: () => (storeSlug ? getStoreCategories(storeSlug) : null),
      enabled: !!storeSlug,
    });

  if (isLoadingStore || isLoadingStoreCategories) {
    return <LoadingSpinner />;
  }

  if (!store) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  if (!storeCategories) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store categories data not found
      </Alerts>
    );
  }

  return (
    <div className="space-y-2 lg:space-y-4">
      <div className="col-span-full space-y-2 lg:space-y-4">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/seller",
            },
            {
              title: "Toko",
              href: "/seller/store",
            },
            {
              title: "Etalase",
              href: "/seller/store-categories",
            },
          ]}
        />

        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Kategori Toko (Etalase)
        </h1>

        <div className="flex flex-col lg:flex-row gap-2 justify-between items-center">
          <FormInput
            className="text-sm w-80"
            id="category-search"
            placeholder="Cari Etalase"
          />
          <ButtonLink size="sm" variant="primary" href="#">
            <MdAdd className="text-base" />
            <span>Tambah Kategori Baru</span>
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 py-6">
        {storeCategories.map((category) => (
          <BaseCard
            key={category.id}
            className="overflow-hidden h-36 flex items-start p-0"
          >
            {category.image ? (
              <div className="w-28 h-full bg-cover bg-center relative overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-all duration-200"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ) : (
              <div className="w-24 h-full bg-cover bg-center relative overflow-hidden">
                <MdOutlineStorefront className="text-4xl" />
              </div>
            )}
            <div className="py-2 px-4">
              <h3 className="text-xl font-medium">{category.name}</h3>
              <span className="text-gray-500">{`${category.products_count} produk`}</span>
            </div>
          </BaseCard>
        ))}
      </div>
    </div>
  );
}
