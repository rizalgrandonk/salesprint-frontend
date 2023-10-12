import { signOut, useSession } from "next-auth/react";
import { PropsWithChildren, useEffect, useState } from "react";
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
          className="relative w-full h-full overflow-y-auto bg-gray-100 px-6 py-4 lg:ml-64 dark:bg-gray-900"
        >
          <main className="">{children}</main>
          {/* <DashboardFooter /> */}
        </div>
      </div>
    </>
  );
}