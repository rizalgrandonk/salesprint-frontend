import AppLogo from "@/components/utils/AppLogo";
import DarkModeToggle from "@/components/utils/DarkModeToggle";
import Redirect from "@/components/utils/Redirect";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, InputHTMLAttributes, useEffect, useState } from "react";

export default function LognPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.error) {
      signOut();
    }
  }, [session]);

  if (session && !session?.user?.error && session?.user?.role) {
    const redirectURL = `/${session.user.role}`;

    return <Redirect to={redirectURL} />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();
    const result = await signIn("credentials", {
      ...form,
      redirect: false,
    });
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleChage = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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

        <div className="flex items-center w-full max-w-lg px-8 bg-white dark:bg-gray-900 text-gray-700 dark:text-white relative">
          <DarkModeToggle className="text-2xl p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 absolute top-4 right-4" />

          <div className="flex-1">
            <div className="flex flex-col gap-4 items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-12">
                  <AppLogo />
                </div>
                <h2 className="text-3xl font-semibold text-cente">
                  Salesprint
                </h2>
              </Link>

              <p className="text-gray-500 dark:text-gray-300">
                Sign in to access your account
              </p>
            </div>

            {error && (
              <div className="mt-6 px-3 py-2 border-2 border-rose-400 text-rose-500 bg-rose-500/10 rounded font-semibold">
                Error: {error}
              </div>
            )}

            <div className="mt-8">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <FormInput
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="example@example.com"
                  onChange={handleChage}
                  value={form.email}
                />
                <FormInput
                  id="password"
                  label="Email Address"
                  type="password"
                  placeholder="Your Password"
                  onChange={handleChage}
                  value={form.password}
                />

                <div className="py-4">
                  <button
                    className="w-full flex justify-center items-center px-4 py-2 tracking-wide text-white transition-colors duration-200 bg-primary rounded-md hover:bg-primary/95 focus:outline-none focus:bg-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:bg-gray-500"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-t-2 border-white mr-4" />
                        {"Loading"}
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-sm text-center text-gray-400">
                Don&#x27;t have an account yet?{" "}
                <a
                  href="#"
                  className="text-primary focus:outline-none focus:underline hover:underline"
                >
                  Sign up
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type FormInputType = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};
function FormInput(props: FormInputType) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="text-sm text-gray-600 dark:text-gray-200"
      >
        {props.label}
      </label>
      <input
        {...props}
        name={props.id}
        id={props.id}
        className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-500 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40"
      />
    </div>
  );
}
