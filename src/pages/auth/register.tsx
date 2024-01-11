import AppLogo from "@/components/utils/AppLogo";
import { Button } from "@/components/utils/Button";
import DarkModeToggle from "@/components/utils/DarkModeToggle";
import FormInput from "@/components/utils/FormInput";
import Meta from "@/components/utils/Meta";
import Redirect from "@/components/utils/Redirect";
import QueryKeys from "@/constants/queryKeys";
import { registerUser } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type RegisterInputs = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
  username: string;
};

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    mode: "all",
  });

  const { data: session } = useSession();
  const { query } = useRouter();

  const queryClient = useQueryClient();

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

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    setIsLoading(true);

    const result = await registerUser(data);
    console.log(result);

    if (!result.success) {
      setIsLoading(false);
      setError(result.message);
      return;
    }
    const loginResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.USER_STORE],
    });

    if (loginResult?.error) {
      setError(loginResult.error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Meta title="Salesprint | Daftar" />

      <div className="flex items-center w-full h-full max-w-2xl py-16 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-100 relative">
        <div className="w-full max-h-full overflow-y-auto px-16">
          <div className="flex flex-col gap-4 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 text-primary">
                <AppLogo />
              </div>
              <h2 className="text-3xl font-semibold text-cente">Salesprint</h2>
            </Link>

            <p className="text-lg text-gray-500 dark:text-gray-300">
              Daftar dan nikmati waktu berbelanja anda
            </p>
          </div>

          {error && (
            <div className="mt-6 px-3 py-2 border-2 border-rose-400 text-rose-500 bg-rose-500/10 rounded font-semibold">
              Error: {error}
            </div>
          )}

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  {...register("name", { required: "Nama harus diisi" })}
                  type="text"
                  id="name"
                  label="Nama"
                  placeholder="Masukan nama anda"
                  error={errors.name?.message}
                />
                <FormInput
                  {...register("username", {
                    required: "Nama pengguna harus diisi",
                  })}
                  type="text"
                  id="username"
                  label="Nama pengguna"
                  placeholder="Masukan nama pengguna anda"
                  error={errors.username?.message}
                />
              </div>
              <FormInput
                {...register("email", { required: "Email harus diisi" })}
                type="email"
                id="email"
                label="Alamat email"
                placeholder="example@example.com"
                error={errors.email?.message}
              />
              <FormInput
                {...register("phone_number", {
                  required: "Nomor telepon harus diisi",
                })}
                type="text"
                id="phone_number"
                label="Nomor telepon"
                placeholder="Masukan nomor telepon anda"
                error={errors.phone_number?.message}
                elementLeft="62"
              />
              <FormInput
                {...register("password", {
                  required: "Kata sandi harus diisi",
                })}
                type="password"
                id="password"
                label="Kata sandi"
                placeholder="Masukan kata sandi anda"
                error={errors.password?.message}
              />
              <FormInput
                {...register("password_confirmation", {
                  required: "Konfirmasi kata sandi harus diisi",
                })}
                type="password"
                id="password_confirmation"
                label="Konfirmasi kata sandi"
                placeholder="Masukan konfirmasi kata sandi anda"
                error={errors.password_confirmation?.message}
              />

              <div className="py-4">
                <Button
                  type="submit"
                  fullWidth
                  variant="primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-t-2 border-white mr-4" />
                      {"Loading"}
                    </>
                  ) : (
                    "Daftar"
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-sm text-center text-gray-400">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="text-primary focus:outline-none focus:underline hover:underline"
              >
                Masuk
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
