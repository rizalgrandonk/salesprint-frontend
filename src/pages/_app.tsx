import AppLayout from "@/components/Layout";
import AuthLayout from "@/components/auth/AuthLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LoadingLogo from "@/components/utils/LoadingLogo";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "react-multi-carousel/lib/styles.css";
import "@/styles/globals.css";
import toast from "@/lib/toast";
import { id } from "date-fns/locale";
import { setDefaultOptions } from "date-fns/setDefaultOptions";
import QueryKeys from "@/constants/queryKeys";

setDefaultOptions({ locale: id });

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

  let layout: "app" | "dashboard" | "auth" =
    path.startsWith("/admin") || path.startsWith("/seller")
      ? "dashboard"
      : path.startsWith("/auth")
      ? "auth"
      : "app";

  return (
    <>
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
  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (session?.user && session?.user.error) {
      signOut();
    }
  }, [session]);

  useEffect(() => {
    if (!userId || !userToken) {
      return;
    }

    // // @ts-ignore
    // window.Pusher = Pusher;

    // const options = {
    //   broadcaster: "pusher",
    //   key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    //   forceTLS: true,
    //   //authEndpoint is your apiUrl + /broadcasting/auth
    //   authEndpoint: process.env.NEXT_PUBLIC_BACKEND_URL + "/broadcasting/auth",
    //   // As I'm using JWT tokens, I need to manually set up the headers.
    //   auth: {
    //     headers: {
    //       Authorization: `Bearer ${userToken}`,
    //       Accept: "application/json",
    //     },
    //   },
    // };

    const echo = new Echo({
      broadcaster: "pusher",
      client: new Pusher(`${process.env.NEXT_PUBLIC_PUSHER_KEY}`, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1",
        wssPort: 443,
        wsPort: 80,
        forceTLS: true,
        enableStats: false,
        enabledTransports: ["ws", "wss"],
        authEndpoint:
          process.env.NEXT_PUBLIC_BACKEND_URL + "/broadcasting/auth",
        auth: {
          headers: {
            Authorization: `Bearer ${userToken}`,
            Accept: "application/json",
          },
        },
      }),
    });
    echo.private(`App.Models.User.${userId}`).notification((data: any) => {
      console.log("data notif", data);
      toast.info(
        { title: data?.title, body: data?.body, action_url: data?.action_url },
        { id: data?.id }
      );

      queryClient.invalidateQueries({
        queryKey: [QueryKeys.USER_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.USER_NOTIFICATIONS_COUNT],
      });
    });

    const beamsClient = new PusherPushNotifications.Client({
      instanceId: process.env.NEXT_PUBLIC_BEAM_INSTANCE_ID ?? "",
    });

    beamsClient
      .start()
      .then(() => beamsClient.addDeviceInterest(`App.Models.User.${userId}`))
      .then(() => {
        console.log("Successfully registered and subscribed!");
      })
      .catch(console.error);

    return () => {
      // echo.disconnect();
      // beamsClient.stop();
    };
  }, [userId]);

  if (layout === "dashboard") {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  if (layout === "auth") {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <AppLayout>{children}</AppLayout>;
}
