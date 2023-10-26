import AppLogo from "@/components/utils/AppLogo";
import Button from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import Redirect from "@/components/utils/Redirect";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

type CreateStoreInputs = {
  name: string;
  slug: string;
  phone_number: string;
  address: string;
  city_id: string;
  province_id: string;
  postal_code: string;
};

export default function CreateStore() {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStoreInputs>({
    mode: "all",
    defaultValues: {
      phone_number: session?.user?.phone_number || "",
    },
  });

  if (!session?.user || session?.user?.error) {
    return <Redirect to="/auth/login" />;
  }

  if (session.user?.role === "seller") {
    return <Redirect to="/seller" />;
  }

  const onSubmit: SubmitHandler<CreateStoreInputs> = async (data) => {
    console.log(data);
  };

  return (
    <div className="flex items-center w-full h-full max-w-xl py-16 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-100 relative">
      <div className="w-full max-h-full overflow-y-auto px-16">
        <div className="flex flex-col gap-4 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 text-primary">
              <AppLogo />
            </div>
            <h2 className="text-3xl font-semibold text-cente">Salesprint</h2>
          </Link>

          <p className="text-lg text-gray-500 dark:text-gray-300">
            Create your store now
          </p>
        </div>

        {/* {error && (
          <div className="mt-6 px-3 py-2 border-2 border-rose-400 text-rose-500 bg-rose-500/10 rounded font-semibold">
            Error: {error}
          </div>
        )} */}

        <div className="mt-8">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              {...register("phone_number", {
                required: "Phone Number is required",
              })}
              type="text"
              id="phone_number"
              label="Phone Number"
              placeholder="Your phone number"
              error={errors.phone_number?.message}
              disabled
            />
            <FormInput
              {...register("name", { required: "Store Name is required" })}
              type="text"
              id="name"
              label="Store Name"
              placeholder="The store name"
              error={errors.name?.message}
            />
            <FormInput
              {...register("address", {
                required: "Store Address is required",
              })}
              type="text"
              id="address"
              label="Store Address"
              placeholder="Input store address"
              error={errors.address?.message}
            />

            <div className="py-4 flex items-center justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Create</Button>
            </div>
          </form>

          {/* <p className="mt-6 text-sm text-center text-gray-400">
            Don&#x27;t have an account yet?{" "}
            <Link
              href="/auth/register"
              className="text-primary focus:outline-none focus:underline hover:underline"
            >
              Sign up
            </Link>
            .
          </p> */}
        </div>
      </div>
    </div>
  );
}
