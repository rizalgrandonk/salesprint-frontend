import Image from "next/image";
import { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen relative">
      <Image
        src="https://source.unsplash.com/random/?mall"
        alt=""
        fill
        loading="lazy"
        className="object-cover -z-10"
        sizes="100vw"
      />

      <div className="w-full h-full flex">
        <div className="hidden lg:flex lg:flex-grow w-full h-full items-center bg-black/20 px-8"></div>
        {children}
      </div>
    </div>
  );
}
