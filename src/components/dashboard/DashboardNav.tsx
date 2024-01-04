import { DEFAULT_USER_IMAGE } from "@/lib/constants";
import { Popover, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import {
  MdAccountCircle,
  MdApps,
  MdClose,
  MdGroups2,
  MdInventory,
  MdLogout,
  MdMenu,
  MdNotifications,
  MdSearch,
  MdSettings,
  MdShoppingBag,
  MdVisibility,
} from "react-icons/md";
import AppLogo from "../utils/AppLogo";
import DarkModeToggle from "../utils/DarkModeToggle";
import Redirect from "../utils/Redirect";
import SearchMenu from "./SearchMenu";

type DashboardNavProps = {
  mobileSidebarOpen: boolean;
  toggleSidebarOpen: (val?: boolean) => void;
};

export default function DashboardNav({
  mobileSidebarOpen,
  toggleSidebarOpen,
}: DashboardNavProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  if (!userRole) {
    return <Redirect to="/" />;
  }

  const dashboardUrl = `/${userRole.toLowerCase()}`;

  return (
    <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={() => toggleSidebarOpen()}
              aria-expanded="true"
              aria-controls="sidebar"
              className="p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {mobileSidebarOpen ? <MdClose /> : <MdMenu />}
            </button>
            <Link
              href={dashboardUrl}
              className="flex items-center gap-2 ml-2 lg:mr-24"
            >
              <div className="h-8 lg:h-10 text-primary">
                <AppLogo />
              </div>
              <span className="font-semibold text-2xl hidden lg:inline">
                Salesprint
              </span>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white capitalize">
                {userRole}
              </span>
            </Link>

            <SearchMenu className="hidden lg:block lg:pl-3.5" />
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => toggleSidebarOpen()}
              id="toggleSidebarMobileSearch"
              type="button"
              className="text-2xl p-2 text-gray-500 rounded lg:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Search</span>
              <MdSearch />
            </button>

            <NotificatiionPanel dashboardUrl={dashboardUrl} />

            <DarkModeToggle className="text-2xl p-2 text-gray-500 rounded sm:flex hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" />

            <div className="flex items-center ml-3">
              <UserPanel dashboardUrl={dashboardUrl} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function UserPanel({ dashboardUrl }: { dashboardUrl: string }) {
  const { data: session } = useSession();
  const userImage = session?.user?.image;
  return (
    <Popover className="relative">
      <Popover.Button className="flex text-sm bg-gray-800 rounded-full hover:ring-4 hover:ring-gray-200 dark:hover:ring-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
        <span className="sr-only">Buka menu user</span>
        <div className="w-8 h-8 relative">
          <Image
            src={userImage || DEFAULT_USER_IMAGE}
            alt=""
            fill
            sizes="2rem"
            loading="lazy"
            className="object-cover rounded-full"
          />
        </div>
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
          className="z-50 absolute right-0 top-full w-60 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
        >
          <div className="px-4 py-3" role="none">
            <p className="text-sm text-gray-900 dark:text-white" role="none">
              {session?.user?.name || ""}
            </p>
            <p
              className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
              role="none"
            >
              {session?.user?.email || ""}
            </p>
          </div>
          <ul className="py-1" role="none">
            <li>
              <Link
                href={dashboardUrl}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href={`${dashboardUrl}/settings`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Pengaturan
              </Link>
            </li>
            <li>
              <Link
                href={`${dashboardUrl}/report`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Laporan
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Kembali ke beranda
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
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

function NotificatiionPanel({ dashboardUrl }: { dashboardUrl: string }) {
  return (
    <Popover className="relative">
      <Popover.Button className="text-2xl p-2 text-gray-500 rounded hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 outline-none border-none">
        <span className="sr-only">Lihat notifikasi</span>
        <MdNotifications />
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
          className="absolute top-full -right-full lg:right-0 z-50 w-72 lg:w-96 my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded shadow-lg dark:divide-gray-600 dark:bg-gray-700"
        >
          <div className="block px-4 py-2 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            Notifikasi
          </div>
          <div>
            <Link
              href={`${dashboardUrl}`}
              className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              <div className="flex-shrink-0">
                <div className="w-11 h-11 relative">
                  <Image
                    src="https://source.unsplash.com/random/?sales person"
                    alt=""
                    fill
                    sizes="2.75rem"
                    loading="lazy"
                    className="object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="w-full pl-3">
                <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                  This is notification content
                </div>
                <div className="text-xs font-medium text-primary dark:text-primary">
                  a few moments ago
                </div>
              </div>
            </Link>
          </div>
          <Link
            href={`${dashboardUrl}/notifications`}
            className="block py-2 text-base font-normal text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline"
          >
            <div className="inline-flex items-center gap-2">
              <MdVisibility className="text-2xl" />
              Lihat semua
            </div>
          </Link>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
