import { Disclosure, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { JSXElementConstructor, useEffect, useState } from "react";
import { IconType } from "react-icons";
import {
  MdChevronLeft,
  MdChevronRight,
  MdKeyboardArrowDown,
  MdOutlineArticle,
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
  isExpand: boolean;
  toggleExpand: (val?: boolean) => void;
};

export default function DashboardSidebar({
  mobileOpen,
  toggleOpen,
  isExpand,
  toggleExpand,
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
          "fixed top-0 left-0 z-30 flex flex-col flex-shrink-0 h-full pt-16 font-normal duration-75 lg:flex transition-all group/sidebar",
          !mobileOpen ? "hidden" : "",
          isExpand ? "w-64" : "w-16"
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
                    isExpand={isExpand}
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
                        isExpand={isExpand}
                      />
                    </li>
                    <li>
                      <MenuItem
                        title="Daftar Kategori"
                        icon={MdOutlineCategory}
                        href="/admin/categories"
                        isExpand={isExpand}
                      />
                    </li>
                    <li>
                      <MenuItem
                        title="Daftar Tipe Varian"
                        icon={MdOutlineLayers}
                        href="/admin/variant-types"
                        isExpand={isExpand}
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
                        isExpand={isExpand}
                      />
                    </li>
                    <li>
                      <MenuItem
                        title="Etalase"
                        icon={MdOutlineStorefront}
                        href="/seller/store-categories"
                        isExpand={isExpand}
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
                        isExpand={isExpand}
                      />
                    </li>
                    <li>
                      <MenuDropdown
                        title="Pesanan"
                        icon={MdOutlineArticle}
                        childs={[
                          {
                            title: "Daftar Pesanan",
                            href: `/seller/orders`,
                          },
                        ]}
                        isExpand={isExpand}
                      />
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div
            onClick={() => toggleExpand()}
            className="absolute top-12 right-0 translate-x-1/2 justify-center items-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer hidden group-hover/sidebar:lg:flex transition-all"
          >
            {isExpand ? <MdChevronLeft /> : <MdChevronRight />}
          </div>
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
  isExpand?: boolean;
};

function MenuItem({
  title,
  href,
  className,
  icon: Icon,
  onClick: onMenuClick,
  active,
  isExpand,
}: MenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    !!onMenuClick && onMenuClick();

    !!href && router.push(href);
  };

  useEffect(() => {
    !!href && router.prefetch(href);
  }, [router, href]);

  const isCurrentPage = router.pathname === href;

  return (
    <button
      onClick={handleClick}
      className={twMerge(
        "w-full flex items-center p-2 text-base text-gray-900 rounded hover:bg-gray-50 group dark:text-gray-200 dark:hover:bg-gray-700",
        !!isCurrentPage ? "bg-gray-50 dark:bg-gray-700" : "",
        !!isCurrentPage ? "text-primary dark:text-primary" : "",

        className
      )}
    >
      {!!Icon && (
        <Icon
          className={twMerge(
            "text-2xl transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
            !!isCurrentPage ? "text-primary dark:text-primary" : ""
          )}
        />
      )}
      {isExpand && <span className="ml-3">{title}</span>}
    </button>
  );
}

type MenuDropdownProps = {
  title: string;
  childs: MenuItemProps[];
  icon?: IconType;
  isExpand?: boolean;
};

function MenuDropdown({
  title,
  childs,
  icon: Icon,
  isExpand,
}: MenuDropdownProps) {
  const { pathname } = useRouter();

  const isActive = childs.some((child) => pathname === child.href);

  return (
    <Disclosure defaultOpen={isActive}>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={twMerge(
              "flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded group hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 text-clip overflow-hidden text-nowrap whitespace-nowrap",
              !!isActive ? "bg-gray-50 dark:bg-gray-700" : "",
              !!isActive ? "text-primary dark:text-primary" : ""
            )}
          >
            {!!Icon && (
              <Icon
                className={twMerge(
                  "text-2xl transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
                  !!isActive ? "text-primary dark:text-primary" : ""
                )}
              />
            )}
            {isExpand && (
              <>
                <span className="flex-1 ml-3 text-left whitespace-nowrap">
                  {title}
                </span>
                <MdKeyboardArrowDown
                  className={twMerge(
                    "text-2xl transition duration-75",
                    open ? "rotate-90" : ""
                  )}
                />
              </>
            )}
          </Disclosure.Button>
          {isExpand && (
            <Disclosure.Panel>
              <ul id="dropdown-layouts" className="py-1 space-y-1">
                {childs.map((child, index) => (
                  <li key={child.title + index}>
                    <MenuItem className="pl-8" {...child} isExpand={isExpand} />
                  </li>
                ))}
              </ul>
            </Disclosure.Panel>
          )}
        </>
      )}
    </Disclosure>
  );
}
