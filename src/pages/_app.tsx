import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppLayout from "@/components/Layout";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import App from "next/app";
import { Poppins } from "next/font/google";
import { PropsWithChildren } from "react";
import "react-multi-carousel/lib/styles.css";

const font = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type AppOwnProps = { dashboard: boolean };

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps & AppOwnProps) {
  const path = router.pathname;

  let layout: "app" | "dashboard" | "auth" = "app";
  if (path.startsWith("/admin") || path.startsWith("/seller")) {
    layout = "dashboard";
  }
  if (path.startsWith("/auth")) {
    layout = "auth";
  }

  return (
    <>
      <style jsx global>
        {`
          html {
            font-family: ${font.style.fontFamily};
          }
        `}
      </style>
      <SessionProvider
        session={session}
        refetchOnWindowFocus={true}
        refetchInterval={5 * 60}
      >
        <WrapperLayout layout={layout}>
          <Component {...pageProps} />
        </WrapperLayout>
      </SessionProvider>
    </>
  );
}

function WrapperLayout({
  children,
  layout,
}: { layout: "app" | "dashboard" | "auth" } & PropsWithChildren) {
  if (layout === "dashboard") {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  if (layout === "auth") {
    return children;
  }

  return <AppLayout>{children}</AppLayout>;
}

// App.getInitialProps = async (
//   context: AppContext
// ): Promise<AppOwnProps & AppInitialProps> => {
//   const ctx = await App.getInitialProps(context);
//   const path = context.router.pathname;

//   if (path.startsWith("/admin") || path.startsWith("/seller")) {
//     return { ...ctx, dashboard: true };
//   }

//   return { ...ctx, dashboard: false };
// };
