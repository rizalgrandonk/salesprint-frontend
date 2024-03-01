import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import {
  getAdminProductsCount,
  getAdminStoresCount,
  getAdminTopOrderProducts,
  getAdminTopOrderStores,
  getAdminTopReviewProducts,
  getAdminTopReviewStores,
  getAdminUsersCount,
  getAdmincategoriesCount,
} from "@/lib/api/dashboard";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_STORE_IMAGE,
} from "@/lib/constants";
import { formatPriceAcro } from "@/lib/formater";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  MdCategory,
  MdDns,
  MdPerson,
  MdStore,
  MdStorefront,
} from "react-icons/md";
import { RiStarFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

export default function AdminDashboard() {
  const { data: session } = useSession();

  const currentUser = session?.user;
  const userId = currentUser?.id;
  const userToken = currentUser?.access_token;

  const { data: productsCount } = useQuery({
    queryKey: ["/dashboard/admin_products_count", userToken],
    queryFn: () => (userToken ? getAdminProductsCount(userToken) : null),
    enabled: !!userToken,
  });
  const { data: storesCount } = useQuery({
    queryKey: ["/dashboard/admin_stores_count", userToken],
    queryFn: () => (userToken ? getAdminStoresCount(userToken) : null),
    enabled: !!userToken,
  });
  const { data: usersCount } = useQuery({
    queryKey: ["/dashboard/admin_users_count", userToken],
    queryFn: () => (userToken ? getAdminUsersCount(userToken) : null),
    enabled: !!userToken,
  });
  const { data: categoriesCount } = useQuery({
    queryKey: ["/dashboard/admin_categories_count", userToken],
    queryFn: () => (userToken ? getAdmincategoriesCount(userToken) : null),
    enabled: !!userToken,
  });

  return (
    <div className="space-y-2 lg:space-y-4 px-3 lg:px-5 pt-1 pb-6">
      <div className="space-y-2">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/admin",
            },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            {`Selamat datang, ${currentUser?.name}`}
          </h1>
          <p className="leading-none text-gray-500 dark:text-gray-400">
            {`Berikut rangkuman data dari Salesprint`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <BaseCard className="flex items-center gap-4 px-4 py-5">
          <div className="h-16 aspect-square flex items-center justify-center rounded bg-primary/20 text-primary">
            <MdDns className="text-5xl" />
          </div>
          <div className="space-y-2">
            <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
              Jumlah Produk
            </p>
            {productsCount && (
              <p className="leading-none text-3xl font-semibold">
                {productsCount.count}
              </p>
            )}
          </div>
        </BaseCard>
        <BaseCard className="flex items-center gap-4 px-4 py-5">
          <div className="h-16 aspect-square flex items-center justify-center rounded bg-primary/20 text-primary">
            <MdStore className="text-5xl" />
          </div>
          <div className="space-y-2">
            <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
              Jumlah Toko
            </p>
            {storesCount && (
              <p className="leading-none text-3xl font-semibold">
                {storesCount.count}
              </p>
            )}
          </div>
        </BaseCard>
        <BaseCard className="flex items-center gap-4 px-4 py-5">
          <div className="h-16 aspect-square flex items-center justify-center rounded bg-primary/20 text-primary">
            <MdPerson className="text-5xl" />
          </div>
          <div className="space-y-2">
            <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
              Jumlah Pengguna
            </p>
            {usersCount && (
              <p className="leading-none text-3xl font-semibold">
                {usersCount.count}
              </p>
            )}
          </div>
        </BaseCard>
        <BaseCard className="flex items-center gap-4 px-4 py-5">
          <div className="h-16 aspect-square flex items-center justify-center rounded bg-primary/20 text-primary">
            <MdCategory className="text-5xl" />
          </div>
          <div className="space-y-2">
            <p className="leading-none uppercase text-sm font-semibold text-gray-500 dark:text-gray-400">
              Jumlah Kategori
            </p>
            {categoriesCount && (
              <p className="leading-none text-3xl font-semibold">
                {categoriesCount.count}
              </p>
            )}
          </div>
        </BaseCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TopOrderProductsSection />
        <TopReviewProductsSection />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TopOrderStoresSection />
        <TopReviewStoresSection />
      </div>

      {/* <div className="grid grid-cols-3 gap-4">
        <ProvinceChart className="col-span-2" />
        <TopCustomersSection />
      </div> */}
    </div>
  );
}

function TopOrderProductsSection({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: products } = useQuery({
    queryKey: ["/dashboard/admin_order_top_products", userToken],
    queryFn: () => (userToken ? getAdminTopOrderProducts(userToken) : null),
    enabled: !!userToken,
  });
  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Produk Terlaris</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Produk dengan penjualan terbanyak
        </p>
      </div>

      <div className="space-y-6">
        {products?.map((product) => (
          <div key={product.id} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={
                  product?.product_images?.find((image) => image.main_image)
                    ?.image_url ||
                  product?.product_images?.[0]?.image_url ||
                  DEFAULT_STORE_CATEGORY_IMAGE
                }
                alt={product?.name ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex-grow space-y-2">
              <p className="leading-tight truncate line-clamp-1">
                {product.name.length > 30
                  ? `${product.name.slice(0, 30)}...`
                  : product.name}
              </p>
              <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
                {`${product.order_count} pesanan`}
              </p>
            </div>
            <div className="font-semibold">
              {formatPriceAcro(product.total_orders)}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
function TopReviewProductsSection({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: products } = useQuery({
    queryKey: ["/dashboard/admin_review_top_products", userToken],
    queryFn: () => (userToken ? getAdminTopReviewProducts(userToken) : null),
    enabled: !!userToken,
  });
  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Ulasan Produk</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Daftar produk dengan ulasan terbanyak
        </p>
      </div>

      <div className="space-y-6">
        {products?.map((product) => (
          <div key={product.id} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={
                  product?.product_images?.find((image) => image.main_image)
                    ?.image_url ||
                  product?.product_images?.[0]?.image_url ||
                  DEFAULT_STORE_CATEGORY_IMAGE
                }
                alt={product?.name ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex-grow space-y-2">
              <p className="leading-tight truncate line-clamp-1">
                {product.name.length > 30
                  ? `${product.name.slice(0, 30)}...`
                  : product.name}
              </p>
              <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
                {`${product.reviews_count} ulasan`}
              </p>
            </div>
            <div className="font-semibold flex items-center gap-1.5">
              <RiStarFill className="text-yellow-500 text-xl" />
              {product.average_rating.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

function TopOrderStoresSection({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: stores } = useQuery({
    queryKey: ["/dashboard/admin_order_top_stores", userToken],
    queryFn: () => (userToken ? getAdminTopOrderStores(userToken) : null),
    enabled: !!userToken,
  });
  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Toko Terlaris</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Toko dengan penjualan terbanyak
        </p>
      </div>

      <div className="space-y-6">
        {stores?.map((store) => (
          <div key={store.id} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={store.image ?? DEFAULT_STORE_IMAGE}
                alt={store?.name ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex-grow space-y-2">
              <p className="leading-tight truncate line-clamp-1">
                {store.name.length > 30
                  ? `${store.name.slice(0, 30)}...`
                  : store.name}
              </p>
              <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
                {`${store.order_count} pesanan`}
              </p>
            </div>
            <div className="font-semibold">
              {formatPriceAcro(store.total_orders)}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
function TopReviewStoresSection({ className }: { className?: string }) {
  const { data: session } = useSession();

  const userToken = session?.user?.access_token;

  const { data: stores } = useQuery({
    queryKey: ["/dashboard/admin_review_top_stores", userToken],
    queryFn: () => (userToken ? getAdminTopReviewStores(userToken) : null),
    enabled: !!userToken,
  });
  return (
    <BaseCard className={twMerge("space-y-8 h-full", className)}>
      <div className="space-y-1.5">
        <p className="leading-none text-xl font-medium">Ulasan Toko</p>
        <p className="leading-none text-sm text-gray-500 dark:text-gray-400 font-light">
          Daftar toko dengan penjualan terbanyak
        </p>
      </div>

      <div className="space-y-6">
        {stores?.map((store) => (
          <div key={store.id} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-12 aspect-square bg-cover bg-center relative rounded overflow-hidden">
              <Image
                src={store.image ?? DEFAULT_STORE_IMAGE}
                alt={store?.name ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex-grow space-y-2">
              <p className="leading-tight truncate line-clamp-1">
                {store.name.length > 30
                  ? `${store.name.slice(0, 30)}...`
                  : store.name}
              </p>
              <p className="leading-none text-sm text-gray-500 dark:text-gray-400">
                {`${store.reviews_count} ulasan`}
              </p>
            </div>
            <div className="font-semibold flex items-center gap-1.5">
              <RiStarFill className="text-yellow-500 text-xl" />
              {store.reviews_avg_rating.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
