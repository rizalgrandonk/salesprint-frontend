import AppLogo from "@/components/utils/AppLogo";
import DarkModeToggle from "@/components/utils/DarkModeToggle";
import FormInput from "@/components/utils/FormInput";
import Redirect from "@/components/utils/Redirect";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type LoginInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { query } = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    mode: "all",
  });

  const { data: session } = useSession();

  if (session && !session?.user?.error) {
    console.log("query.callbackUrl", query.callbackUrl);
    console.log("session?.user?.role", session?.user?.role);

    const redirectURL = query.callbackUrl
      ? query.callbackUrl
      : session?.user?.role === "admin"
      ? `/admin`
      : "/";

    console.log("redirectURL", redirectURL);

    return (
      <Redirect
        to={Array.isArray(redirectURL) ? redirectURL[0] : redirectURL}
      />
    );
  }

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center w-full h-full max-w-xl py-16 bg-white dark:bg-gray-900 text-gray-700 dark:text-white relative">
      <DarkModeToggle className="text-2xl p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 absolute top-4 right-4" />

      <div className="w-full max-h-full overflow-y-auto px-16">
        <div className="flex flex-col gap-4 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12">
              <AppLogo />
            </div>
            <h2 className="text-3xl font-semibold text-cente">Salesprint</h2>
          </Link>

          <p className="text-lg text-gray-500 dark:text-gray-300">
            Sign in to access your account
          </p>
        </div>

        {error && (
          <div className="mt-6 px-3 py-2 border-2 border-rose-400 text-rose-500 bg-rose-500/10 rounded font-semibold">
            Error: {error}
          </div>
        )}

        <div className="mt-8">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              {...register("email", { required: "Email is required" })}
              type="email"
              id="email"
              label="Email Address"
              placeholder="example@example.com"
              error={errors.email?.message}
            />
            <FormInput
              {...register("password", { required: "Password is required" })}
              type="password"
              id="password"
              label="Password"
              placeholder="Your Password"
              error={errors.password?.message}
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
            <Link
              href="/auth/register"
              className="text-primary focus:outline-none focus:underline hover:underline"
            >
              Sign up
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
