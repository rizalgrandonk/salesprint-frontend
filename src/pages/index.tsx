import { signIn, signOut, useSession } from "next-auth/react";
import { Inter, Poppins } from "next/font/google";

const fonts = Poppins({ weight: "400", subsets: ["latin"] });

export default function Home() {
  const { data: session } = useSession();

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${fonts.className}`}
    >
      <h1 className="text-4xl">Hello World</h1>
      {!session && (
        <button
          onClick={() => signIn()}
          className="px-4 py-2 bg-blue-400 outline-none border-none"
          type="button"
        >
          Sign In
        </button>
      )}
    </main>
  );
}
