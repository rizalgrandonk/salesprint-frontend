import Link from "next/link";
import React from "react";
import { RiArrowRightSLine } from "react-icons/ri";

type BreadcrumbProps = {
  navList: {
    title: string;
    href: string;
  }[];
};

export default function Breadcrumb({ navList }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
        {navList.map(({ title, href }, index) => (
          <li key={index + href}>
            <div className="flex items-center">
              <RiArrowRightSLine />
              <Link
                href={href}
                className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
              >
                {title}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
