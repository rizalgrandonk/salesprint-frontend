import { signOut, useSession } from "next-auth/react";
import { PropsWithChildren, useEffect } from "react";
import DashboardFooter from "./DashboardFooter";
import DashboardNav from "./DashboardNav";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { data: session } = useSession({ required: true });
  console.log(session);

  useEffect(() => {
    if (session?.user.error === "error_refresh_token") {
      signOut();
    }
  }, []);

  return (
    <>
      <DashboardNav />
      <div className="flex pt-20 overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 h-screen">
        <DashboardSidebar />
        <div
          id="main-content"
          className="relative w-full h-full overflow-y-auto bg-gray-50 px-6 py-4 lg:ml-64 dark:bg-gray-900"
        >
          <main className="">{children}</main>
          {/* <DashboardFooter /> */}
        </div>
      </div>
    </>
  );
}
