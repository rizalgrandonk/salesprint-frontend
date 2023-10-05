import AppLogo from "@/components/utils/AppLogo";
import DarkModeToggle from "@/components/utils/DarkModeToggle";
import FormInput from "@/components/utils/FormInput";
import Redirect from "@/components/utils/Redirect";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type RegisterInputs = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
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

  useEffect(() => {
    if (session?.user.error) {
      signOut();
    }
  }, [session]);

  if (session && !session?.user?.error && session?.user?.role) {
    const redirectURL = `/${session.user.role}`;

    return <Redirect to={redirectURL} />;
  }

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    console.log(data);
    // setIsLoading(true);
    // const result = await signIn("credentials", {
    //   ...data,
    //   redirect: false,
    // });
    // if (result?.error) {
    //   setError(result.error);
    // }
    // setIsLoading(false);
  };

  return (
    <div className="flex items-center w-full h-full max-w-4xl py-16 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-white relative">
      <DarkModeToggle className="text-2xl p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 absolute top-4 right-4" />

      <div className="w-full max-h-full overflow-y-auto px-8">
        <div className="flex flex-col gap-4 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12">
              <AppLogo />
            </div>
            <h2 className="text-3xl font-semibold text-cente">Salesprint</h2>
          </Link>

          <p className="text-lg text-gray-500 dark:text-gray-300">
            Sign up and enjoy your shopping time
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
                {...register("name", { required: "Name is required" })}
                type="text"
                id="name"
                label="Name"
                placeholder="Enter your name"
                error={errors.name?.message}
              />
              <FormInput
                {...register("email", { required: "Email is required" })}
                type="email"
                id="email"
                label="Email Address"
                placeholder="example@example.com"
                error={errors.email?.message}
              />
            </div>
            <FormInput
              {...register("phone_number", {
                required: "Phone number is required",
              })}
              type="text"
              id="phone_number"
              label="Phone Number"
              placeholder="Enter your phone number"
              error={errors.phone_number?.message}
              leftel="62"
            />
            <FormInput
              {...register("password", { required: "Password is required" })}
              type="password"
              id="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
            />
            <FormInput
              {...register("password_confirmation", {
                required: "Password confirmation is required",
              })}
              type="password"
              id="password_confirmation"
              label="Password Confirmation"
              placeholder="Enter your password confirmation"
              error={errors.password_confirmation?.message}
            />

            <div className="py-4 flex flex-col items-center">
              <button
                className="w-full max-w-md flex justify-center items-center px-4 py-2 tracking-wide text-white transition-colors duration-200 bg-primary rounded-md hover:bg-primary/95 focus:outline-none focus:bg-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:bg-gray-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-t-2 border-white mr-4" />
                    {"Loading"}
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-center text-gray-400">
            Already have account?{" "}
            <Link
              href="/auth/login"
              className="text-primary focus:outline-none focus:underline hover:underline"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
