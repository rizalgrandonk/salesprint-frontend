import { capitalizeString } from "@/lib/formater";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import Meta from "../utils/Meta";
import DashboardFooter from "./DashboardFooter";
import DashboardNav from "./DashboardNav";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { data: session, status } = useSession({ required: true });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);

  const toggleSidebarOpen = (value?: boolean) =>
    setMobileSidebarOpen((prev) => (value !== undefined ? value : !prev));
  const toggleSidebarExpand = (value?: boolean) =>
    setIsSidebarExpand((prev) => (value !== undefined ? value : !prev));

  const sessioinError = session?.user?.error;

  useEffect(() => {
    if (sessioinError) {
      signOut();
    }
  }, [sessioinError]);

  if (status === "loading") {
    return "Loading...";
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Meta title={`${capitalizeString(session.user.role)} | Salesprint`} />

      <DashboardNav
        mobileSidebarOpen={mobileSidebarOpen}
        toggleSidebarOpen={toggleSidebarOpen}
      />
      <div className="flex pt-20 overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-screen">
        <DashboardSidebar
          mobileOpen={mobileSidebarOpen}
          toggleOpen={toggleSidebarOpen}
          isExpand={isSidebarExpand}
          toggleExpand={toggleSidebarExpand}
        />
        <div
          id="main-content"
          className={twMerge(
            "relative w-full h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-all duration-75",
            isSidebarExpand ? "lg:ml-64" : "lg:ml-16"
          )}
        >
          <main className="min-h-[75%]">{children}</main>
          {/* <DashboardFooter /> */}
        </div>
      </div>
    </>
  );
}
