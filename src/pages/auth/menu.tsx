import AppLogo from "@/components/utils/AppLogo";
import BaseCard from "@/components/utils/BaseCard";
import { Button, ButtonLink } from "@/components/utils/Button";
import Meta from "@/components/utils/Meta";
import QueryKeys from "@/constants/queryKeys";
import { getUserStore } from "@/lib/api/stores";
import { DEFAULT_STORE_IMAGE, DEFAULT_USER_IMAGE } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";

export default function MenuPage() {
  const { data: session } = useSession();

  const userData = session?.user;

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  return (
    <>
      <Meta title="Menu | Salesprint" />
      <div className="flex w-full h-full max-w-xl pt-16 pb-4 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100 relative">
        <div className="w-full max-h-full overflow-y-auto space-y-4 px-2 lg:px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 text-primary">
              <AppLogo />
            </div>
            <h2 className="text-xl font-semibold text-cente">Salesprint</h2>
          </Link>

          <h1 className="text-3xl font-semibold">Menu Utama</h1>

          {!userData && (
            <div className="space-y-1">
              <p>Silahkan masuk untuk menikmati fitur lengkap</p>
              <div className="flex items-center gap-4">
                <ButtonLink href="/auth/register" className="flex-grow">
                  Daftar
                </ButtonLink>
                <ButtonLink href="/auth/login" className="flex-grow" outline>
                  Masuk
                </ButtonLink>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="relative h-16 aspect-square rounded-full overflow-hidden">
                <Image
                  src={userData?.image || DEFAULT_USER_IMAGE}
                  alt={userData?.username ?? ""}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold my-0 leading-none">
                  {userData?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-0 leading-none">
                  {userData?.email}
                </p>
              </div>
            </div>
            <ul className="py-3" role="none">
              <li>
                <Link
                  href={"/user/orders"}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                  role="menuitem"
                >
                  Pesanan
                </Link>
              </li>
              {/* <li>
                <Link
                  href={`/user/profile`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                  role="menuitem"
                >
                  Profil
                </Link>
              </li> */}
              <li>
                <Link
                  href={`/user/reviews`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                  role="menuitem"
                >
                  Ulasan
                </Link>
              </li>
            </ul>
          </div>

          <div className="h-3 bg-gray-200 dark:bg-gray-700" />

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="relative h-16 aspect-square rounded-full overflow-hidden">
                <Image
                  src={store?.image || DEFAULT_STORE_IMAGE}
                  alt={store?.name ?? ""}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold my-0 leading-none">
                  {store?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-0 leading-none">
                  {store?.city}
                </p>
              </div>
            </div>
            {(!userData || (userData && store)) && (
              <ul className="py-3" role="none">
                <li>
                  <Link
                    href={"/seller/orders"}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Pesanan
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/seller/products`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Produk
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/seller/store`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Info
                  </Link>
                </li>
              </ul>
            )}
            {!!userData && !store && (
              <div className="px-6 py-3">
                <ButtonLink href="/auth/user/create-store" className="w-full">
                  Buka Toko Gratis
                </ButtonLink>
              </div>
            )}
          </div>

          {!!userData && (
            <div className="px-6 py-3">
              <Button
                onClick={() => signOut()}
                className="w-full"
                variant="danger"
                outline
              >
                <MdOutlineLogout className="text-lg" />
                Keluar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
