import { signIn, signOut, useSession } from "next-auth/react";
import { Inter, Poppins } from "next/font/google";

const fonts = Poppins({ weight: "400", subsets: ["latin"] });

export default function Home() {
  const { data: session } = useSession();
  console.log(session);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${fonts.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        Hello World
      </div>
      {session ? (
        <div>
          {session.user.name}
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-blue-400 outline-none border-none"
            type="button"
          >
            Sign Out
          </button>
        </div>
      ) : (
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
