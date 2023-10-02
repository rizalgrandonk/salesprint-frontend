// import { localize } from "@/lib/formater";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const { locale } = useRouter();

  return (
    <>
      <div className="w-full py-14 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 text-gray-900 dark:text-gray-100">
        <div className="container px-6 lg:px-16 h-full mx-auto flex flex-col md:flex-row space-y-10 md:space-y-0 justify-between items-start">
          <div className="w-full md:w-1/4 flex justify-between items-start">
            <div>
              <h4 className="text-xl font-semibold mb-6">Navigate</h4>
              <ul>
                <li className="py-1">
                  <Link
                    href="/"
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Home
                  </Link>
                </li>
                <li className="py-1">
                  <Link
                    href="/"
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Products
                  </Link>
                </li>
                <li className="py-1">
                  <Link
                    href="/"
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Categories
                  </Link>
                </li>
                <li className="py-1">
                  <Link
                    href="/seller"
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Seller Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full md:w-1/4 text-center md:text-right">
            <h3 className="text-2xl font-semibold mb-8">
              Mojokerto, Jawa Timur, Indonesia
            </h3>
            <p className="mb-2">contact@grandonkmerch.com</p>
            <p>+6281234567890</p>
          </div>
        </div>
      </div>
      <div className="w-full py-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        <div className="container px-6 lg:px-16 h-full mx-auto flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between items-center md:items-start">
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
