import Image from "next/image";
import { PropsWithChildren } from "react";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import DarkModeToggle from "../utils/DarkModeToggle";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen relative">
      <Image
        src="https://source.unsplash.com/random/?mall"
        alt=""
        fill
        loading="lazy"
        className="object-cover"
        sizes="100vw"
      />

      <DarkModeToggle className="text-gray-900 dark:text-gray-100 text-2xl hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded absolute right-4 top-4 z-50">
        {(dark) => (dark ? <RiMoonLine /> : <RiSunLine />)}
      </DarkModeToggle>

      <div className="w-full h-full flex">
        <div className="hidden lg:flex lg:flex-grow h-full items-center bg-black/30 px-8 z-10"></div>

        {children}
      </div>
    </div>
  );
}
