import clsx from "clsx";
import {
  MdArrowDropDown,
  MdDashboardCustomize,
  MdInventory,
  MdKeyboardArrowDown,
  MdSearch,
} from "react-icons/md";

type DashboardSidebarProps = {
  mobileOpen: boolean;
  toggleOpen: (val?: boolean) => void;
};

export default function DashboardSidebar({
  mobileOpen,
  toggleOpen,
}: DashboardSidebarProps) {
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
                  <form action="#" method="GET" className="lg:hidden">
                    <label htmlFor="mobile-search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-2xl text-gray-500 dark:text-gray-400">
                        <MdSearch />
                      </div>
                      <input
                        type="text"
                        name="email"
                        id="mobile-search"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-primary dark:focus:border-primary outline-none"
                        placeholder="Search"
                      />
                    </div>
                  </form>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <MdDashboardCustomize className="text-2xl text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                    <span className="ml-3">Dashboard</span>
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    aria-controls="dropdown-layouts"
                    data-collapse-toggle="dropdown-layouts"
                  >
                    <MdInventory className="text-2xl text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                      Products
                    </span>
                    <MdKeyboardArrowDown className="text-2xl" />
                  </button>
                  <ul id="dropdown-layouts" className="py-2 space-y-2">
                    <li>
                      <a
                        href="#"
                        className="flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Add New
                      </a>
                    </li>
                  </ul>
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
