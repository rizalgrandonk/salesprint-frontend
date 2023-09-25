import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import App from "next/app";
import "react-multi-carousel/lib/styles.css";

type AppOwnProps = { dashboard: boolean };

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps & AppOwnProps) {
  const path = router.pathname;

  if (path.startsWith("/admin") || path.startsWith("/seller")) {
    return (
      <SessionProvider session={session}>
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
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
