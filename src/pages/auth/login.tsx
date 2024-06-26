import AppLogo from "@/components/utils/AppLogo";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import Meta from "@/components/utils/Meta";
import Redirect from "@/components/utils/Redirect";
import QueryKeys from "@/constants/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const { data: session } = useSession();

  if (session && !session?.user?.error) {
    console.log("query.callbackUrl", query.callbackUrl);
    console.log("session?.user?.role", session?.user?.role);

    const userRole = session?.user?.role;
    const callbackUrl = query.callbackUrl?.toString();

    if (!userRole) {
      return <Redirect to="/" />;
    }

    if (callbackUrl) {
      if (userRole !== "user" && !callbackUrl.startsWith(`/${userRole}`)) {
        return <Redirect to={`/${userRole}`} />;
      }

      return <Redirect to={callbackUrl} />;
    }

    const redirectURL = userRole !== "user" ? `/${userRole}` : "/";

    return <Redirect to={redirectURL} />;
  }

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_STORE],
    });

    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Meta title="Masuk | Salesprint" />

      <div className="flex items-center w-full h-full max-w-xl py-16 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100 relative">
        <div className="w-full max-h-full overflow-y-auto px-8 lg:px-16">
          <div className="flex flex-col gap-4 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 text-primary">
                <AppLogo />
              </div>
              <h2 className="text-3xl font-semibold text-cente">Salesprint</h2>
            </Link>

            <p className="text-lg text-gray-500 dark:text-gray-300">
              Masuk untuk mengakses akun anda
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
                {...register("email", { required: "Email harus diisi" })}
                type="email"
                id="email"
                label="Alamat email"
                placeholder="example@example.com"
                error={errors.email?.message}
              />
              <FormInput
                {...register("password", {
                  required: "Kata sandi harus diisi",
                })}
                type="password"
                id="password"
                label="Kata sandi"
                placeholder="Kata sandi anda"
                error={errors.password?.message}
              />

              <div className="py-4">
                <Button
                  fullWidth
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-t-2 border-white mr-4" />
                      {"Loading"}
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-sm text-center text-gray-400">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="text-primary focus:outline-none focus:underline hover:underline"
              >
                Daftar
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
