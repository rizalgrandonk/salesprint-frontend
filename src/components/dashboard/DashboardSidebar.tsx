import { Disclosure, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { JSXElementConstructor } from "react";
import { IconType } from "react-icons";
import {
  MdKeyboardArrowDown,
  MdOutlineCategory,
  MdOutlineDashboardCustomize,
  MdOutlineDns,
  MdOutlineInventory2,
  MdOutlineLayers,
  MdOutlinePerson,
  MdOutlineStore,
  MdOutlineStorefront,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";
import SearchMenu from "./SearchMenu";

type DashboardSidebarProps = {
  mobileOpen: boolean;
  toggleOpen: (val?: boolean) => void;
};

export default function DashboardSidebar({
  mobileOpen,
  toggleOpen,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const { pathname } = router;

  return (
    <>
      <aside
        id="sidebar"
        className={twMerge(
          "fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width",
          !mobileOpen ? "hidden" : ""
        )}
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <ul className="pb-2 space-y-2">
                <li>
                  <SearchMenu className="lg:hidden" />
                </li>
                <li>
                  <MenuItem
                    title="Dashboard"
                    href={`/${user?.role || ""}`}
                    icon={MdOutlineDashboardCustomize}
                  />
                </li>
                {/* <li>
                  <MenuDropdown
                    title="Produk"
                    icon={MdOutlineInventory2}
                    childs={[
                      {
                        title: "Tambah Baru",
                        href: "#",
                      },
                      {
                        title: "Daftar Produk",
                        href: "#",
                      },
                    ]}
                  />
                </li> */}
                {user?.role === "admin" && (
                  <>
                    <li>
                      <MenuItem
                        title="Daftar Toko"
                        icon={MdOutlineStorefront}
                        href="/admin/stores"
                      />
                    </li>
                    <li>
                      <MenuItem
                        title="Daftar Kategori"
                        icon={MdOutlineCategory}
                        href="/admin/categories"
                      />
                    </li>
                    <li>
                      <MenuItem
                        title="Daftar Tipe Varian"
                        icon={MdOutlineLayers}
                        href="/admin/variant-types"
                      />
                    </li>
                  </>
                )}
                {user?.role === "seller" && (
                  <>
                    <li>
                      <MenuDropdown
                        title="Toko"
                        icon={MdOutlineStore}
                        childs={[
                          {
                            title: "Halaman & Info",
                            href: `/seller/store`,
                          },
                          {
                            title: "Pengaturan",
                            href: "/seller/store/settings",
                          },
                        ]}
                      />
                    </li>
                    <li>
                      <MenuItem
                        title="Etalase"
                        icon={MdOutlineStorefront}
                        href="/seller/store-categories"
                      />
                    </li>
                    <li>
                      <MenuDropdown
                        title="Produk"
                        icon={MdOutlineDns}
                        childs={[
                          {
                            title: "Daftar Produk",
                            href: `/seller/products`,
                          },
                          {
                            title: "Tambah Produk",
                            href: "/seller/products/create",
                          },
                        ]}
                      />
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* <div className="absolute bottom-0 left-0 justify-center hidden w-full p-4 space-x-4 bg-white lg:flex dark:bg-gray-800">
          </div> */}
        </div>
      </aside>

      <div
        onClick={() => toggleOpen()}
        className={twMerge(
          "fixed inset-0 z-10 bg-gray-900/50 dark:bg-gray-900/90",
          !mobileOpen ? "hidden" : ""
        )}
        id="sidebarBackdrop"
      ></div>
    </>
  );
}

type MenuItemProps = {
  title: string;
  href?: string;
  active?: boolean;
  className?: string;
  icon?: IconType;
  onClick?: () => void;
};

function MenuItem({
  title,
  href,
  className,
  icon: Icon,
  onClick: onMenuClick,
  active,
}: MenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    !!onMenuClick && onMenuClick();

    !!href && router.push(href);
  };

  const isCurrentPage = router.pathname === href;

  return (
    <button
      onClick={handleClick}
      className={twMerge(
        "w-full flex items-center p-2 text-base text-gray-900 rounded hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700",
        !!isCurrentPage ? "bg-gray-100 dark:bg-gray-700" : "",
        !!isCurrentPage ? "text-primary dark:text-primary" : "",

        className
      )}
    >
      {!!Icon && (
        <Icon
          className={twMerge(
            "text-2xl transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
            !!isCurrentPage ? "text-gray-900 dark:text-white" : "text-gray-500"
          )}
        />
      )}
      <span className="ml-3">{title}</span>
    </button>
  );
}

type MenuDropdownProps = {
  title: string;
  childs: MenuItemProps[];
  icon?: IconType;
};

function MenuDropdown({ title, childs, icon: Icon }: MenuDropdownProps) {
  const { pathname } = useRouter();
  return (
    <Disclosure defaultOpen={childs.some((item) => item.href === pathname)}>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
            {!!Icon && (
              <Icon className="text-2xl text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
            )}
            <span className="flex-1 ml-3 text-left whitespace-nowrap">
              {title}
            </span>
            <MdKeyboardArrowDown
              className={twMerge(
                "text-2xl transition duration-75",
                !open ? "rotate-90" : ""
              )}
            />
          </Disclosure.Button>
          <Disclosure.Panel>
            <ul id="dropdown-layouts" className="py-1 space-y-1">
              {childs.map((child, index) => (
                <li key={child.title + index}>
                  <MenuItem className="pl-8" {...child} />
                </li>
              ))}
            </ul>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
