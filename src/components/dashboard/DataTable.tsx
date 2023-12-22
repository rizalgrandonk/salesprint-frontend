import { ReactNode, ThHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type DataTableHeader<T> = ThHTMLAttributes<HTMLTableCellElement> & {
  id: string;
  render: ((list: T[]) => ReactNode) | ReactNode;
};

export type DataTableColumn<T> = ThHTMLAttributes<HTMLTableCellElement> & {
  id: string;
  render: ((item: T) => ReactNode) | ReactNode;
};

export type DataTableProps<T> = {
  list: T[];
  headers: DataTableHeader<T>[];
  columns: DataTableColumn<T>[];
};

export default function DataTable<T>({
  headers,
  columns,
  list,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto flex-grow">
      <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600 relative border-b border-gray-200 dark:border-gray-600">
        <thead className="bg-white dark:bg-gray-800 sticky top-0 z-20 shadow">
          <tr>
            {headers.map(
              ({
                className: headerClassName,
                render: renderHeader,
                ...headerProps
              }) => (
                <th
                  {...headerProps}
                  scope="col"
                  className={twMerge(
                    "p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400",
                    headerClassName
                  )}
                >
                  {typeof renderHeader === "function"
                    ? renderHeader(list)
                    : renderHeader}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-gray-100 dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {list.map((item) => (
            <tr className="hover:bg-white dark:hover:bg-gray-800">
              {columns.map(
                ({
                  className: colClassName,
                  render: renderCol,
                  ...colProps
                }) => (
                  <td
                    {...colProps}
                    className={twMerge(
                      "p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white",
                      colClassName
                    )}
                  >
                    {typeof renderCol === "function"
                      ? renderCol(item)
                      : renderCol}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
