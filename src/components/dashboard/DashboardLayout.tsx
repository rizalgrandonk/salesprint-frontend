import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import Meta from "../utils/Meta";
import DashboardFooter from "./DashboardFooter";
import DashboardNav from "./DashboardNav";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { data: session, status } = useSession({ required: true });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = (value?: boolean) =>
    setMobileSidebarOpen((prev) => (value !== undefined ? value : !prev));

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

      <Meta
        seo={{
          title: `Salesprint ${session.user.role}`,
        }}
      />

      <DashboardNav
        mobileSidebarOpen={mobileSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex pt-20 overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-screen">
        <DashboardSidebar
          mobileOpen={mobileSidebarOpen}
          toggleOpen={toggleSidebar}
        />
        <div
          id="main-content"
          className="relative w-full h-full overflow-y-auto bg-gray-100 px-3 lg:px-5 py-1 lg:ml-64 dark:bg-gray-900"
        >
          <main className="min-h-[80%]">{children}</main>
          <DashboardFooter />
        </div>
      </div>
    </>
  );
}
