import Link from "next/link";
import { RiGithubFill, RiInstagramLine, RiTwitterFill } from "react-icons/ri";

export default function DashboardFooter() {
  return (
    <footer className="py-6 space-y-6">
      <div className="p-5 bg-white rounded shadow lg:flex lg:items-center lg:justify-between dark:bg-gray-800">
        <ul className="flex flex-wrap items-center space-y-1 lg:mb-0">
          <li>
            <a
              href="#"
              className="mr-4 text-sm font-normal text-gray-500 hover:underline lg:mr-6 dark:text-gray-400"
            >
              Syarat dan ketentuan
            </a>
          </li>
        </ul>
        <div className="flex space-x-6 sm:justify-center">
          <a
            href="#"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl"
            target="_blank"
          >
            <RiGithubFill />
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl"
            target="_blank"
          >
            <RiInstagramLine />
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl"
            target="_blank"
          >
            <RiTwitterFill />
          </a>
        </div>
      </div>
      <p className="text-sm text-center text-gray-500">
        &copy; 2023{" "}
        <Link href="/" className="hover:underline">
          Salesprint
        </Link>
        . All rights reserved.
      </p>
    </footer>
  );
}
