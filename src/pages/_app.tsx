import AppLayout from "@/components/Layout";
import AuthLayout from "@/components/auth/AuthLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LoadingLogo from "@/components/utils/LoadingLogo";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import { Router } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "react-multi-carousel/lib/styles.css";
import "@/styles/globals.css";

const font = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const queryClient = new QueryClient();

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps) {
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
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CartProvider>
              <WrapperLayout layout={layout}>
                <Component {...pageProps} />
                <Toaster position="top-right" />
              </WrapperLayout>
            </CartProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}

function WrapperLayout({
  children,
  layout,
}: { layout: "app" | "dashboard" | "auth" } & PropsWithChildren) {
  const { data: session, status } = useSession();
  const { isLoading: isLoadingCart } = useCart();
  // const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // useEffect(() => {
  //   const start = () => {
  //     setIsLoadingRoute(true);
  //   };
  //   const end = () => {
  //     setIsLoadingRoute(false);
  //   };
  //   Router.events.on("routeChangeStart", start);
  //   Router.events.on("routeChangeComplete", end);
  //   Router.events.on("routeChangeError", end);
  //   return () => {
  //     Router.events.off("routeChangeStart", start);
  //     Router.events.off("routeChangeComplete", end);
  //     Router.events.off("routeChangeError", end);
  //   };
  // }, []);

  useEffect(() => {
    if (session?.user && session?.user.error) {
      signOut();
    }
  }, [session]);

  if (status === "loading" || isLoadingCart) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 h-screen w-screen text-primary flex items-center justify-center flex-col gap-4">
        <div className="h-[60vh] aspect-square">
          <LoadingLogo />
        </div>
      </div>
    );
  }

  if (layout === "dashboard") {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  if (layout === "auth") {
    return <AuthLayout>{children}</AuthLayout>;
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
