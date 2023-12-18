import Link from "next/link";
import React from "react";
import { RiArrowRightSLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

type BreadcrumbProps = {
  navList: {
    title: string;
    href: string;
  }[];
};

export default function Breadcrumb({ navList }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 text-sm font-medium">
        {navList.map(({ title, href }, index) => (
          <li key={index + href}>
            <div className="flex items-center gap-1">
              {index > 0 && <RiArrowRightSLine className="text-xl" />}
              <Link
                href={href}
                className={twMerge(
                  "text-gray-700 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-dark",
                  index === navList.length - 1
                    ? "text-primary dark:text-primary"
                    : ""
                )}
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
