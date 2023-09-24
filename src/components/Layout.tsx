import { PropsWithChildren } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main className="bg-light min-h-screen overflow-hidden">{children}</main>
      <Footer />
    </>
  );
}
