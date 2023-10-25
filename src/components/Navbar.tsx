// import { useCart } from "@/contexts/CartContext";
// import { localize } from "@/lib/formater";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import {
  RiHome3Fill,
  RiHome3Line,
  RiLayoutMasonryFill,
  RiLayoutMasonryLine,
  RiMoonLine,
  RiShoppingCartLine,
  RiStoreLine,
  RiSunLine,
  RiTShirt2Fill,
  RiTShirt2Line,
  RiUserFill,
  RiUserLine,
} from "react-icons/ri";

import { getUserStore } from "@/lib/api/store";
import { DEFAULT_STORE_IMAGE, DEFAULT_USER_IMAGE } from "@/lib/constants";
import { Popover, Transition } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { MdSearch } from "react-icons/md";
import AppLogo from "./utils/AppLogo";
import DarkModeToggle from "./utils/DarkModeToggle";

export default function Navbar() {
  // const [activeNavbar, setActiveNavbar] = useState(false);

  // useEffect(() => {
  //   const changeColor = () => {
  //     if (window.scrollY >= 30) {
  //       setActiveNavbar(true);
  //     } else {
  //       setActiveNavbar(false);
  //     }
  //   };

  //   window.addEventListener("scroll", changeColor);

  //   return () => {
  //     window.removeEventListener("scroll", changeColor);
  //   };
  // }, []);
  // const { totalItems } = useCart();
  const { data: session } = useSession();

  const { asPath, locale } = useRouter();

  return (
    <>
      <nav
        className={`fixed z-20 w-full h-16 lg:h-20 transition-all bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm border-b border-gray-300 dark:border-gray-600`}
      >
        <div className="container h-full mx-auto flex justify-between items-center">
          <div className="h-full py-5">
            <Link href="/" className="flex items-center gap-2 h-full">
              <span className="text-primary h-full">
                <AppLogo />
              </span>
              <span className="text-3xl font-semibold hidden lg:inline">
                Salesprint
              </span>
            </Link>
          </div>
          {/* <div className="hidden h-full w-1/2 lg:w-2/5 lg:flex items-center justify-between">
            <Link
              href="/products"
              className="hover:text-primary font-medium uppercase"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="hover:text-primary font-medium uppercase"
            >
              Categories
            </Link>
          </div> */}
          <div className="flex-grow px-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-2xl text-gray-700 dark:text-gray-300">
                <MdSearch />
              </div>
              <input
                type="text"
                name="nav_search"
                className="bg-gray-100 border border-gray-300 dark:border-gray-600 text-gray-900 rounded focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 dark:bg-gray-900 dark:placeholder-gray-400 dark:text-gray-100 outline-none"
                placeholder="Search"
              />
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <Link
              href="/cart"
              className="hidden lg:inline relative p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <span className="text-2xl">
                <RiShoppingCartLine />
              </span>
              {/* {totalItems > 0 && (
                  <span className="absolute right-0 top-1 block h-5 w-5 text-sm text-center bg-red-600 rounded-full">
                    {totalItems}
                  </span>
                )} */}
            </Link>

            <DarkModeToggle className="text-2xl hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
              {(dark) => (dark ? <RiMoonLine /> : <RiSunLine />)}
            </DarkModeToggle>

            {!session?.user && (
              <div className="hidden lg:flex items-center gap-2 pl-4 py-1 border-l border-gray-400 dark:border-gray-500">
                <Link
                  href="/auth/register"
                  locale="en"
                  className="px-3 py-1 border border-primary text-sm font-medium text-gray-200 bg-primary hover:bg-primary-dark rounded"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/login"
                  locale="id"
                  className="px-3 py-1 border border-primary text-sm font-medium hover:bg-primary-dark hover:text-gray-200 rounded"
                >
                  Sign In
                </Link>
              </div>
            )}

            {!!session?.user && (
              <div className="pl-4 border-l border-gray-400 dark:border-gray-500 flex items-center gap-3">
                <StorePanel />
                <UserPanel />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav
        className="lg:hidden block fixed inset-x-0 -bottom-0.5 z-10 bg-white text-primary"
        style={{ boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex justify-between">
          <Link
            href="/"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath == "/" ? <RiHome3Fill /> : <RiHome3Line />}
            </span>
            <span className="block text-xs">Home</span>
          </Link>
          <Link
            href="/products"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/products") ? (
                <RiTShirt2Fill />
              ) : (
                <RiTShirt2Line />
              )}
            </span>
            <span className="block text-xs">Products</span>
          </Link>

          <div className="w-full flex flex-col justify-center items-center">
            <Link
              href="/cart"
              className="w-16 h-16 bg-primary rounded-full flex justify-center items-center absolute bottom-2 left-1/2 -translate-x-1/2 hover:bg-opacity-95 focus:bg-opacity-95"
            >
              <span className="text-4xl text-gray-200 relative focus:text-primary hover:text-primary">
                <RiShoppingCartLine />
                {/* {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs text-center bg-red-600 rounded-full text-gray-200">
                      {totalItems}
                    </span>
                  )} */}
              </span>
            </Link>
          </div>

          <Link
            href="/categories"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/categories") ? (
                <RiLayoutMasonryFill />
              ) : (
                <RiLayoutMasonryLine />
              )}
            </span>
            <span className="block text-xs">Categories</span>
          </Link>
          <Link
            href="/profile"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/profile") ? <RiUserFill /> : <RiUserLine />}
            </span>
            <span className="block text-xs">Profile</span>
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
        <span className="sr-only">Open user menu</span>
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
            <li>
              <Link
                href={"/user/orders"}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                href={`/user/settings`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Settings
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Sign Out
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

  const { data: store } = useQuery(
    ["/user/user_store", userId],
    () => getUserStore(session?.user?.access_token),
    {
      enabled: !!userId,
    }
  );

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-2 py-1.5 px-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
        <span className="sr-only">Open store menu</span>
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
          {store?.name || "Store"}
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
                <p
                  className="text-lg text-gray-900 dark:text-gray-200"
                  role="none"
                >
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
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/seller/settings`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                    role="menuitem"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </Fragment>
          ) : (
            <div
              className="px-4 py-3 flex flex-col items-center gap-3"
              role="none"
            >
              <p
                className="text-sm text-center text-gray-900 dark:text-gray-200"
                role="none"
              >
                Anda belum memiliki toko
              </p>
              <Link
                href="/seller/register"
                className="px-3 py-1 border border-primary font-medium text-gray-100 bg-primary hover:bg-primary/95 rounded"
              >
                Buka toko gratis
              </Link>
            </div>
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
