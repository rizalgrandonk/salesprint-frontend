import { DEFAULT_USER_IMAGE } from "@/lib/constants";
import { Popover, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import {
  MdAccountCircle,
  MdApps,
  MdClose,
  MdGroups2,
  MdInventory,
  MdLogout,
  MdMenu,
  MdNotifications,
  MdOutlineInfo,
  MdSearch,
  MdSettings,
  MdShoppingBag,
  MdVisibility,
} from "react-icons/md";
import AppLogo from "../utils/AppLogo";
import DarkModeToggle from "../utils/DarkModeToggle";
import Redirect from "../utils/Redirect";
import SearchMenu from "./SearchMenu";
import { useInView } from "react-intersection-observer";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import QueryKeys from "@/constants/queryKeys";
import {
  getUserNotifications,
  getUserNotificationsCount,
  markReadUserNotifications,
} from "@/lib/api/notifications";
import { formatRelative } from "date-fns/formatRelative";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { Button } from "../utils/Button";

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
              className="p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-50 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {mobileSidebarOpen ? <MdClose /> : <MdMenu />}
            </button>
            <Link
              href={dashboardUrl}
              className="flex items-center gap-2 ml-2 lg:mr-24"
            >
              <div className="h-8 w-8 lg:h-10 lg:w-10 text-primary">
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
              className="text-2xl p-2 text-gray-500 rounded lg:hidden hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Search</span>
              <MdSearch />
            </button>

            <NotificatiionPanel dashboardUrl={dashboardUrl} />

            <DarkModeToggle className="text-2xl p-2 text-gray-500 rounded sm:flex hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" />

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
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href={`${dashboardUrl}/settings`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Pengaturan
              </Link>
            </li>
            <li>
              <Link
                href={`${dashboardUrl}/report`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Laporan
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem"
              >
                Kembali ke beranda
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
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
  const { data: session } = useSession();
  const userToken = session?.user?.access_token;
  const userId = session?.user?.id;

  const { ref: sectionStartRef, inView: sectionStartInView } = useInView();
  const { ref: lastItemRef, inView: lastItemInView } = useInView();

  const [queryState, setQueryState] = useState<{
    type: "read" | "unread" | "all";
    limit: number;
  }>({
    limit: 5,
    type: "unread",
  });

  const {
    data: dataNotifs,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [QueryKeys.USER_NOTIFICATIONS, { ...queryState, userId }],
    queryFn: ({ pageParam = 1 }) =>
      userToken
        ? getUserNotifications(userToken, { ...queryState, page: pageParam })
        : null,
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : null,
    enabled: !!sectionStartInView && !!userToken,
  });

  const { data: notifCount } = useQuery({
    queryKey: [QueryKeys.USER_NOTIFICATIONS_COUNT, userId],
    queryFn: () =>
      userToken
        ? getUserNotificationsCount(userToken, { type: "unread" })
        : null,
    enabled: !!userToken,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (lastItemInView && hasNextPage) {
      fetchNextPage();
    }
  }, [lastItemInView, fetchNextPage, hasNextPage]);

  const handleMarkRead = async () => {
    if (queryState.type !== "unread") {
      return;
    }

    if (!userToken) {
      return;
    }

    await markReadUserNotifications(userToken);

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_NOTIFICATIONS],
    });
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_NOTIFICATIONS_COUNT],
    });

    setQueryState((prev) => ({
      ...prev,
      type: "all",
    }));
  };

  return (
    <Popover className="relative">
      <Popover.Button className="text-2xl p-2 text-gray-500 rounded hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 outline-none border-none relative">
        <span className="sr-only">Lihat notifikasi</span>

        {!!notifCount?.count && notifCount.count > 0 && (
          <span className="h-4 w-4 rounded-full flex items-center justify-center bg-red-500 text-white text-xxs absolute right-1 top-1">
            {notifCount?.count}
          </span>
        )}
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
          className="absolute top-full -right-full lg:right-0 z-50 w-72 lg:w-96 my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-lg dark:divide-gray-600 dark:bg-gray-700"
        >
          <div className="px-4 py-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="leading-none text-base font-medium text-gray-700 dark:text-gray-400">
                Notifikasi
              </p>

              {queryState.type === "unread" && (
                <span
                  onClick={() => handleMarkRead()}
                  className="text-xs text-primary cursor-pointer"
                >
                  Tandai sudah dibaca
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  setQueryState((prev) => ({
                    ...prev,
                    type: "all",
                  }))
                }
                size="sm"
                outline={queryState.type !== "all"}
                className="px-4 h-6"
              >
                Semua
              </Button>
              <Button
                onClick={() =>
                  setQueryState((prev) => ({
                    ...prev,
                    type: "read",
                  }))
                }
                size="sm"
                outline={queryState.type !== "read"}
                className="px-4 h-6"
              >
                Dibaca
              </Button>
              <Button
                onClick={() =>
                  setQueryState((prev) => ({
                    ...prev,
                    type: "unread",
                  }))
                }
                size="sm"
                outline={queryState.type !== "unread"}
                className="px-4 h-6"
              >
                Belum Dibaca
              </Button>
            </div>
          </div>
          <div
            className="max-h-96 overflow-y-auto divide-y divide-gray-300 dark:divide-gray-600"
            ref={sectionStartRef}
          >
            {!!dataNotifs &&
            dataNotifs.pages.length > 0 &&
            dataNotifs.pages[0]?.data &&
            dataNotifs.pages[0]?.data?.length > 0 ? (
              dataNotifs?.pages.map((group, idx) =>
                group?.data.map((notif, i) => (
                  <div
                    ref={
                      dataNotifs?.pages.length === idx + 1 &&
                      group.data.length === i + 1
                        ? lastItemRef
                        : undefined
                    }
                    className={twMerge(
                      "flex-grow flex items-start gap-3 cursor-pointer px-4 py-3",
                      !notif.read_at ? "bg-primary/5" : ""
                    )}
                    key={notif.id}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded flex items-center justify-center bg-sky-500/20 dark:bg-sky-500/20 text-sky-500">
                      <MdOutlineInfo className="text-2xl" />
                    </div>

                    <div className="flex-grow space-y-1.5">
                      <p className="leading-none">{notif.data.title}</p>
                      <p className="text-sm leading-snug text-gray-500 dark:text-gray-400">
                        {notif.data.body}
                      </p>
                      <p className="text-xs leading-snug text-gray-600 dark:text-gray-300">
                        {formatRelative(new Date(notif.created_at), new Date())}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="px-4 py-3 text-center text-xl">
                Belum ada notifikasi
              </div>
            )}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
