import { useSession } from "next-auth/react";
import Image from "next/image";
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
import AppLogo from "../AppLogo";
import DarkModeToggle from "../DarkModeToggle";

type DashboardNavProps = {
  mobileSidebarOpen: boolean;
  toggleSidebar: (val?: boolean) => void;
};

export default function DashboardNav({
  mobileSidebarOpen,
  toggleSidebar,
}: DashboardNavProps) {
  const { data: session } = useSession();

  return (
    <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={() => toggleSidebar()}
              aria-expanded="true"
              aria-controls="sidebar"
              className="p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {mobileSidebarOpen ? <MdClose /> : <MdMenu />}
            </button>
            <a href="/" className="flex items-center gap-2 ml-2 md:mr-24">
              <div className="h-8 lg:h-10">
                <AppLogo />
              </div>
              <span className="font-semibold text-2xl hidden lg:inline">
                Salesprint
              </span>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white capitalize">
                {session?.user.role}
              </span>
            </a>
            <form className="hidden lg:block lg:pl-3.5">
              <label htmlFor="topbar-search" className="sr-only">
                Search
              </label>
              <div className="relative mt-1 lg:w-96">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-2xl text-gray-500 dark:text-gray-400">
                  <MdSearch />
                </div>
                <input
                  type="text"
                  name="email"
                  id="topbar-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary outline-none"
                  placeholder="Search"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => toggleSidebar()}
              id="toggleSidebarMobileSearch"
              type="button"
              className="text-2xl p-2 text-gray-500 rounded-lg lg:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Search</span>
              <MdSearch />
            </button>

            <button
              type="button"
              data-dropdown-toggle="notification-dropdown"
              className="text-2xl p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 relative"
            >
              <span className="sr-only">View notifications</span>
              {/* Icon */}
              <MdNotifications />

              <div
                className="hidden top-full right-0 z-50 w-96 my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded shadow-lg dark:divide-gray-600 dark:bg-gray-700"
                id="notification-dropdown"
              >
                <div className="block px-4 py-2 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  Notifications
                </div>
                <div>
                  <a
                    href="#"
                    className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 relative">
                        <Image
                          src="https://source.unsplash.com/random/?sales person"
                          alt=""
                          fill
                          loading="lazy"
                          className="object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                        New message from{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Bonnie Green
                        </span>
                        : "Hey, what's up? All set for the presentation?"
                      </div>
                      <div className="text-xs font-medium text-primary dark:text-primary">
                        a few moments ago
                      </div>
                    </div>
                  </a>
                </div>
                <a
                  href="#"
                  className="block py-2 text-base font-normal text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline"
                >
                  <div className="inline-flex items-center gap-2">
                    <MdVisibility className="text-2xl" />
                    View all
                  </div>
                </a>
              </div>
            </button>
            {/* Menu Drop */}

            {/* Apps */}
            <button
              type="button"
              data-dropdown-toggle="apps-dropdown"
              className="hidden text-2xl p-2 text-gray-500 rounded-lg sm:flex hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 relative"
            >
              <span className="sr-only">View notifications</span>
              {/* Icon */}
              <MdApps />

              <div
                className="z-50 hidden absolute top-full right-0 w-80 my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded shadow-lg dark:bg-gray-700 dark:divide-gray-600"
                id="apps-dropdown"
              >
                <div className="block px-4 py-2 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  Apps
                </div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  <a
                    href="#"
                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MdShoppingBag className="text-3xl inline-block mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Sales
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MdGroups2 className="text-3xl inline-block mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Users
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MdAccountCircle className="text-3xl inline-block mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Profile
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MdSettings className="text-3xl inline-block mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Settings
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MdInventory className="text-3xl inline-block mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Products
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MdLogout className="text-3xl inline-block mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Logout
                    </div>
                  </a>
                </div>
              </div>
            </button>

            <DarkModeToggle className="text-2xl p-2 text-gray-500 rounded-lg sm:flex hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" />

            <div className="flex items-center ml-3">
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 relative"
                id="user-menu-button-2"
                aria-expanded="false"
                data-dropdown-toggle="dropdown-2"
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 relative">
                  <Image
                    src="https://source.unsplash.com/random/?seller"
                    alt=""
                    fill
                    loading="lazy"
                    className="object-cover rounded-full"
                  />
                </div>

                <div
                  className="z-50 hidden absolute right-0 top-full w-60 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
                  id="dropdown-2"
                >
                  <div className="px-4 py-3" role="none">
                    <p
                      className="text-sm text-gray-900 dark:text-white"
                      role="none"
                    >
                      Neil Sims
                    </p>
                    <p
                      className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                      role="none"
                    >
                      neil.sims@flowbite.com
                    </p>
                  </div>
                  <ul className="py-1" role="none">
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Settings
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Earnings
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
