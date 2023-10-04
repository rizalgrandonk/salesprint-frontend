// import { useCart } from "@/contexts/CartContext";
// import { localize } from "@/lib/formater";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  RiBillFill,
  RiBillLine,
  RiHome3Fill,
  RiHome3Line,
  RiLayoutMasonryFill,
  RiLayoutMasonryLine,
  RiShoppingCartLine,
  RiTShirt2Fill,
  RiTShirt2Line,
} from "react-icons/ri";

import { MdLightMode, MdModeNight } from "react-icons/md";
import AppLogo from "./utils/AppLogo";
import DarkModeToggle from "./utils/DarkModeToggle";

export default function Navbar() {
  const [activeNavbar, setActiveNavbar] = useState(false);

  useEffect(() => {
    const changeColor = () => {
      if (window.scrollY >= 30) {
        setActiveNavbar(true);
      } else {
        setActiveNavbar(false);
      }
    };

    window.addEventListener("scroll", changeColor);

    return () => {
      window.removeEventListener("scroll", changeColor);
    };
  }, []);
  // const { totalItems } = useCart();

  const { asPath, locale } = useRouter();

  return (
    <>
      <nav
        className={`fixed z-20 w-full h-16 md:h-20 text-white transition-all ${
          activeNavbar ? "bg-secondary" : ""
        }`}
      >
        <div className="container px-6 lg:px-16 h-full mx-auto flex justify-between items-center">
          <div className="h-full py-5">
            <Link href="/" className="flex items-center gap-2 h-full">
              <AppLogo />
              <span className="text-3xl font-semibold hidden lg:inline">
                Salesprint
              </span>
            </Link>
          </div>
          <div className="hidden h-full w-1/2 lg:w-2/5 lg:flex items-center justify-between">
            <Link href="/" className="hover:text-primary font-medium uppercase">
              Home
            </Link>
            <Link
              href="/products"
              className="hover:text-primary font-medium uppercase"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="hover:text-primary font-medium uppercase"
            >
              Categories
            </Link>
          </div>

          <div className="flex justify-between items-center gap-6">
            {/* <Link href="/cart" className="hidden lg:inline relative p-2 rounded-full hover:bg-white/10">
                <span className="text-4xl">
                  <RiShoppingCartLine />
                </span>
                {totalItems > 0 && (
                  <span className="absolute right-0 top-1 block h-5 w-5 text-sm text-center bg-red-600 rounded-full">
                    {totalItems}
                  </span>
                )}
            </Link> */}

            <DarkModeToggle className="text-xl hover:bg-gray-50/10 hover:text-primary p-2 rounded" />

            {/* <div className="flex justify-between items-center">
              <Link href="/" locale="en" className={`px-3 py-1 uppercase border border-white md:text-xl font-medium ${
                    locale == "en" ? "text-secondary bg-white" : ""
                  }`}
                >
                  en
              </Link>
              <Link href="/" locale="id" className={`px-3 py-1 uppercase border border-white md:text-xl font-medium ${
                    locale == "id" ? "text-secondary bg-white" : ""
                  }`}
                >
                  id
              </Link>
            </div> */}
          </div>
        </div>
      </nav>

      <nav
        className="lg:hidden block fixed inset-x-0 -bottom-0.5 z-10 bg-white text-secondary"
        style={{ boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex justify-between">
          <Link
            href="/"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath == "/" ? <RiHome3Fill /> : <RiHome3Line />}
            </span>
            <span className="block text-xs">Home</span>
          </Link>
          <Link
            href="/products"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/products") ? (
                <RiTShirt2Fill />
              ) : (
                <RiTShirt2Line />
              )}
            </span>
            <span className="block text-xs">Products</span>
          </Link>

          <div className="w-full flex flex-col justify-center items-center">
            {/* <Link href="/cart" className="w-16 h-16 bg-secondary rounded-full flex justify-center items-center absolute bottom-2 left-1/2 -translate-x-1/2 hover:bg-opacity-95 focus:bg-opacity-95">
                <span className="text-4xl text-white relative focus:text-primary hover:text-primary">
                  <RiShoppingCartLine />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs text-center bg-red-600 rounded-full text-white">
                      {totalItems}
                    </span>
                  )}
                </span>
            </Link> */}
          </div>

          <Link
            href="/categories"
            className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2"
          >
            <span className="text-2xl">
              {asPath.startsWith("/categories") ? (
                <RiLayoutMasonryFill />
              ) : (
                <RiLayoutMasonryLine />
              )}
            </span>
            <span className="block text-xs">Categories</span>
          </Link>
          {/* <Link href="/orders" className="w-full focus:text-primary hover:text-primary flex flex-col justify-between items-center py-2">
              <span className="text-2xl">
                {asPath.startsWith("/orders") ? <RiBillFill /> : <RiBillLine />}
              </span>
              <span className="block text-xs">
                {localize(locale, "orders")}
              </span>
          </Link> */}
        </div>
      </nav>
    </>
  );
}
