import Head from "next/head";
import Script from "next/script";
import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Navbar />
      <main className="bg-light dark:bg-dark text-dark dark:text-light min-h-screen overflow-hidden">
        {children}
      </main>
      <Footer />
    </>
  );
}
