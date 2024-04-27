// import { localize } from "@/lib/formater";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const { locale } = useRouter();

  return (
    <>
      <div className="w-full py-14 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 text-gray-900 dark:text-gray-100">
        <div className="container h-full flex flex-col lg:flex-row space-y-10 lg:space-y-0 justify-between items-center lg:items-start">
          <div className="w-full lg:w-1/4">
            {/* <div> */}
            <h4 className="text-xl font-semibold mb-6 text-center lg:text-left">Navigasi</h4>
            <ul>
              <li className="py-1 text-center lg:text-left">
                <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Beranda
                </Link>
              </li>
              <li className="py-1 text-center lg:text-left">
                <Link href="/categories" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Kategori
                </Link>
              </li>
            </ul>
            {/* </div> */}
          </div>
          <div className="w-full lg:w-1/4 text-center lg:text-right">
            <h3 className="text-2xl font-semibold mb-8">Mojokerto, Jawa Timur, Indonesia</h3>
            <p className="mb-2">contact@grandonkmerch.com</p>
            <p>+6281234567890</p>
          </div>
        </div>
      </div>
      <div className="w-full py-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        <div className="container h-full flex flex-col lg:flex-row space-y-4 lg:space-y-0 justify-between items-center lg:items-start">
          <p className="text-sm">Copyright &copy; Rizal Grandonk</p>
          <div className="flex items-center">
            <h4 className="font-semibold mr-4">Social Media</h4>
            <div className="flex text-lg space-x-3">
              <FaTwitter />
              <FaFacebook />
              <FaInstagram />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
