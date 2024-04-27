// import { useCart } from "@/contexts/CartContext";
// import { localize } from "@/lib/formater";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import {
  RiAppsFill,
  RiAppsLine,
  RiFileList3Fill,
  RiFileList3Line,
  RiHome3Fill,
  RiHome3Line,
  RiLayoutMasonryFill,
  RiLayoutMasonryLine,
  RiMoonLine,
  RiShoppingCartLine,
  RiStickyNoteFill,
  RiStickyNoteLine,
  RiStoreLine,
  RiSunLine,
  RiTShirt2Fill,
  RiTShirt2Line,
  RiUserFill,
  RiUserLine,
} from "react-icons/ri";

import QueryKeys from "@/constants/queryKeys";
import { useCart } from "@/contexts/CartContext";
import { getUserStore } from "@/lib/api/stores";
import { DEFAULT_STORE_IMAGE, DEFAULT_USER_IMAGE } from "@/lib/constants";
import { Popover, Transition } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { MdSearch } from "react-icons/md";
import AppLogo from "./utils/AppLogo";
import { Button, ButtonLink } from "./utils/Button";
import DarkModeToggle from "./utils/DarkModeToggle";
import { twMerge } from "tailwind-merge";

export default function Navbar() {
  const { totalItems } = useCart();

  const { data: session } = useSession();
  const userData = session?.user;

  const router = useRouter();

  const { asPath, locale } = router;

  const keywordQuery = router.query.keyword?.toString();
  const [searchKeyword, setSearchKeyword] = useState(keywordQuery ?? "");

  useEffect(() => {
    router.prefetch("/search");
  }, [router]);

  return (
    <>
      <nav
        className={`fixed z-20 w-full h-16 lg:h-20 transition-all bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm border-b border-gray-300 dark:border-gray-600`}
      >
        <div className="container h-full mx-auto flex justify-between items-center">
          <div className="h-full py-4 lg:py-5">
            <Link href="/" className="flex items-center gap-2 h-full">
              <span className="text-primary h-full">
                <AppLogo />
              </span>
              <span className="text-3xl font-semibold hidden lg:inline">Salesprint</span>
            </Link>
          </div>
          <div className="flex-grow px-4 lg:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!searchKeyword) {
                  return;
                }

                router.push(`/search?keyword=${searchKeyword}`);
              }}
              className="relative w-full"
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-2xl text-gray-700 dark:text-gray-300">
                <MdSearch />
              </div>
              <input
                type="text"
                name="nav_search"
                className="bg-gray-50 border border-gray-300 dark:border-gray-600 text-gray-900 rounded focus:ring-primary focus:border-primary block w-full pl-12 px-2.5 py-2 dark:bg-gray-900 dark:placeholder-gray-400 dark:text-gray-100 outline-none"
                placeholder="Cari di Salesprint"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </form>
          </div>

          <div className="flex justify-between items-center gap-4">
            {(!userData?.role || userData.role === "user") && (
              <Link
                href="/cart"
                className="hidden lg:inline relative p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <span className="text-2xl">
                  <RiShoppingCartLine />
                </span>
                {totalItems > 0 && (
                  <span className="absolute right-0 top-1 block h-5 w-5 text-sm text-center text-white bg-primary rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <DarkModeToggle className="text-2xl hover:bg-gray-200 dark:hover:bg-gray-800 lg:p-2 rounded">
              {(dark) => (dark ? <RiMoonLine /> : <RiSunLine />)}
            </DarkModeToggle>

            {!session?.user && (
              <div className="hidden lg:flex items-center gap-2 pl-4 py-1 border-l border-gray-400 dark:border-gray-500">
                <ButtonLink size="sm" variant="primary" href="/auth/register">
                  Daftar
                </ButtonLink>
                <ButtonLink size="sm" variant="primary" outline href="/auth/login">
                  Masuk
                </ButtonLink>
              </div>
            )}

            {!!userData && (
              <div className="pl-4 border-l border-gray-400 dark:border-gray-500 hidden lg:flex items-center gap-3">
                {userData.role !== "admin" && <StorePanel />}
                <UserPanel />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav
        className="lg:hidden block fixed inset-x-0 -bottom-0.5 z-10 transition-all bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm border-t border-gray-300 dark:border-gray-600"
        style={{ boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex justify-between">
          <Link
            href="/"
            className={twMerge(
              "w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2",
              asPath === "/" ? "text-primary" : ""
            )}
          >
            <span className="text-2xl">{asPath == "/" ? <RiHome3Fill /> : <RiHome3Line />}</span>
            <span className="block text-xs">Beranda</span>
          </Link>
          <Link
            href="/categories"
            className={twMerge(
              "w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2",
              asPath.startsWith("/categories") ? "text-primary" : ""
            )}
          >
            <span className="text-2xl">
              {asPath.startsWith("/categories") ? <RiLayoutMasonryFill /> : <RiLayoutMasonryLine />}
            </span>
            <span className="block text-xs">Kategori</span>
          </Link>

          {(!userData?.role || userData.role === "user") && (
            <div className="w-full flex flex-col justify-center items-center">
              <Link
                href="/cart"
                className="w-16 h-16 bg-primary rounded-full flex justify-center items-center absolute bottom-2 left-1/2 -translate-x-1/2 hover:bg-opacity-95 focus:bg-opacity-95"
              >
                <span className="text-4xl text-gray-200 relative focus:text-primary hover:text-primary">
                  <RiShoppingCartLine />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs text-center text-white bg-rose-500 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </span>
              </Link>
            </div>
          )}

          <Link
            href="/profile"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/profile") ? <RiUserFill /> : <RiUserLine />}
            </span>
            <span className="block text-xs">Profil</span>
          </Link>
          <Link
            href="/auth/menu"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/auth/menu") ? <RiAppsFill /> : <RiAppsLine />}
            </span>
            <span className="block text-xs">Menu</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

function UserPanel() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-2 py-1.5 px-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
        <span className="sr-only">Buka menu user</span>
        <div className="w-9 h-9 relative rounded-full">
          <Image
            src={user.image || DEFAULT_USER_IMAGE}
            alt={user.name || ""}
            fill
            sizes="2rem"
            loading="lazy"
            className="object-cover rounded-full"
          />
        </div>
        <span className="inline-block max-w-[3.5rem] overflow-hidden truncate">
          {user.username || ""}
        </span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-x-1"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-1"
      >
        <Popover.Panel
          as="div"
          className="z-50 absolute right-0 top-full w-60 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-800 dark:divide-gray-600"
        >
          <div className="px-4 py-3" role="none">
            <p className="text-lg text-gray-900 dark:text-gray-200" role="none">
              {user.name || ""}
            </p>
            <p
              className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
              role="none"
            >
              {user.email || ""}
            </p>
          </div>
          <ul className="py-3" role="none">
            {user.role === "user" && (
              <>
                <li>
                  <Link
                    href={"/user/orders"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Pesanan
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/user/reviews"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Ulasan
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                href={`/profile`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Profil
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Keluar
              </button>
            </li>
          </ul>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

function StorePanel() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () => getUserStore(userToken),
    enabled: !!userId && !!userToken,
  });

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-2 py-1.5 px-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
        <span className="sr-only">Buka menu toko</span>
        <div className="w-9 h-9 relative rounded-full overflow-hidden">
          <Image
            src={store?.image || DEFAULT_STORE_IMAGE}
            alt=""
            fill
            sizes="2rem"
            loading="lazy"
            className="object-cover rounded-full"
          />
        </div>
        <span className="inline-block max-w-[3.5rem] overflow-hidden truncate">
          {store?.name || "Toko"}
        </span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-x-1"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-1"
      >
        <Popover.Panel
          as="div"
          className="z-50 absolute right-0 top-full w-72 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-800 dark:divide-gray-600"
        >
          {store ? (
            <Fragment>
              <div className="px-4 py-3" role="none">
                <p className="text-lg text-gray-900 dark:text-gray-200" role="none">
                  {store.name || ""}
                </p>
                <p
                  className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                  role="none"
                >
                  {store.city || ""}
                </p>
              </div>
              <ul className="py-1" role="none">
                <li>
                  <Link
                    href={"/seller/orders"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Pesanan
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/seller/products"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Produk
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/seller/store`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Info
                  </Link>
                </li>
              </ul>
            </Fragment>
          ) : (
            <div className="px-4 py-3 flex flex-col items-center gap-3" role="none">
              <p className="text-sm text-center text-gray-900 dark:text-gray-200" role="none">
                Anda belum memiliki toko
              </p>
              <ButtonLink href="/auth/user/create-store" variant="primary">
                Buka toko gratis
              </ButtonLink>
            </div>
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
