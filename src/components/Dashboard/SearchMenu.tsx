import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { IconType } from "react-icons";
import {
  MdDashboardCustomize,
  MdInventory,
  MdLibraryAdd,
  MdPerson,
  MdSearch,
  MdStore,
  MdStorefront,
} from "react-icons/md";

type Menu = {
  title: string;
  icon: IconType;
  href?: string;
  onClick?: () => void;
};

const menuList: Menu[] = [
  {
    title: "Dashboard",
    href: "",
    icon: MdDashboardCustomize,
  },
  {
    title: "Add New Product",
    href: "/products/add",
    icon: MdLibraryAdd,
  },
  {
    title: "Product List",
    href: "/products",
    icon: MdInventory,
  },
  {
    title: "Edit Store",
    href: "/store/edit",
    icon: MdStore,
  },
  {
    title: "Storefront",
    href: "/store/storefront",
    icon: MdStorefront,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: MdPerson,
  },
];

export default function SearchMenu({ className }: { className?: string }) {
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();

  const [selected, setSelected] = useState<Menu | undefined>();
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? menuList.slice(0, 5)
      : menuList
          .filter((person) =>
            person.title
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, ""))
          )
          .slice(0, 5);

  const handleOnChange = (value: Menu) => {
    if (value.href && user?.role) {
      const url = `/${user.role}${value.href}`;
      router.push(url);
    }
    setSelected(value);
  };

  return (
    <form className={clsx("relative", className)}>
      <label htmlFor="topbar-search" className="sr-only">
        Search
      </label>
      <Combobox value={selected} onChange={handleOnChange}>
        <div className="relative mt-1 lg:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-2xl text-gray-500 dark:text-gray-400">
            <MdSearch />
          </div>
          <Combobox.Input
            type="text"
            name="app_search"
            id="topbar-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary outline-none"
            placeholder="Search"
            displayValue={(menu: Menu) => menu.title}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <Combobox.Options className="absolute mt-1 w-full lg:w-screen max-w-xl overflow-auto rounded-md bg-gray-50/50 dark:bg-gray-700/50 py-2 text-base text-gray-900 dark:text-white shadow-lg ring-1 ring-gray-700/5 dark:ring-gray-50/50 backdrop-blur-sm focus:outline-none sm:text-sm">
          {filtered.length === 0 && query !== "" ? (
            <div className="relative cursor-default select-none py-2 px-4">
              Nothing found.
            </div>
          ) : (
            filtered.map((menu, index) => (
              <Combobox.Option
                key={menu.title + index}
                className={({ active }) =>
                  clsx(
                    "relative cursor-pointer select-none py-2 px-3 flex items-center gap-3",
                    {
                      "bg-primary text-black": active,
                    }
                  )
                }
                value={menu}
              >
                {({ selected, active }) => (
                  <>
                    <div
                      className={clsx(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        { "bg-white/30": active }
                      )}
                    >
                      <menu.icon className="text-3xl" />
                    </div>
                    <div className="">
                      <p className="text-lg">{menu.title}</p>
                      <p
                        className={clsx(
                          "text-sm text-gray-700 dark:text-gray-500",
                          { "text-gray-800 dark:text-gray-600": active }
                        )}
                      >
                        {`/${user?.role || ""}${menu.href || ""}`}
                      </p>
                    </div>
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>
    </form>
  );
}
