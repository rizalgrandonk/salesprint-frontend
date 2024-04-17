import { ButtonLink } from "@/components/utils/Button";
import { RiUserForbidFill } from "react-icons/ri";

export default function Custom403() {
  return (
    <section className="container pb-6 lg:pb-12 min-h-screen flex gap-6 items-center">
      <div className="w-full lg:w-2/3 space-y-4">
        <h1 className="leading-none text-2xl">403</h1>
        <h2 className="text-4xl font-semibold">Akses halaman ditolak!</h2>
        <p className="leading-none text-gray-500 dark:text-gray-400">
          Maaf, kamu tidak dapat mengakses halaman ini
        </p>
        <ButtonLink href="/">Ke Halaman Utama</ButtonLink>
      </div>
      <div className="hidden lg:flex lg:w-1/3 items-center justify-start pr-8">
        <div className="w-full aspect-square flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
          <RiUserForbidFill className="text-9xl scale-150 text-slate-500" />
        </div>
      </div>
    </section>
  );
}
