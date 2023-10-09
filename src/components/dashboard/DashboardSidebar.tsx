import { Disclosure, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { JSXElementConstructor } from "react";
import { IconType } from "react-icons";
import {
  MdArrowDropDown,
  MdDashboardCustomize,
  MdInventory,
  MdKeyboardArrowDown,
  MdPerson,
  MdPerson2,
  MdPerson3,
  MdSearch,
  MdStore,
  MdStorefront,
} from "react-icons/md";
import { JsxElement } from "typescript";
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
        className={clsx(
          "fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width",
          { hidden: !mobileOpen }
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
                    icon={MdDashboardCustomize}
                    active={pathname === `/${user?.role || ""}`}
                  />
                </li>
                <li>
                  <MenuDropdown
                    title="Products"
                    icon={MdInventory}
                    childs={[
                      {
                        title: "Add New",
                        href: "#",
                      },
                      {
                        title: "Product List",
                        href: "#",
                      },
                    ]}
                  />
                </li>
                <li>
                  <MenuDropdown
                    title="Store"
                    icon={MdStore}
                    childs={[
                      {
                        title: "Edit Appearance",
                        href: "#",
                      },
                      {
                        title: "Storefront",
                        href: "#",
                      },
                    ]}
                  />
                </li>
                <li>
                  <MenuItem title="Profile" href="#" icon={MdPerson} />
                </li>
              </ul>
            </div>
          </div>

          {/* <div className="absolute bottom-0 left-0 justify-center hidden w-full p-4 space-x-4 bg-white lg:flex dark:bg-gray-800">
          </div> */}
        </div>
      </aside>

      <div
        onClick={() => toggleOpen()}
        className={clsx(
          "fixed inset-0 z-10 bg-gray-900/50 dark:bg-gray-900/90",
          { hidden: !mobileOpen }
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
  return (
    <button
      onClick={handleClick}
      className={clsx(
        "w-full flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700",
        {
          "bg-gray-100 dark:bg-gray-700": !!active,
        },
        className
      )}
    >
      {!!Icon && (
        <Icon
          className={clsx(
            "text-2xl text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
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
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
            {!!Icon && (
              <Icon className="text-2xl text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
            )}
            <span className="flex-1 ml-3 text-left whitespace-nowrap">
              {title}
            </span>
            <MdKeyboardArrowDown
              className={clsx("text-2xl transition duration-75", {
                "rotate-90": !open,
              })}
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
