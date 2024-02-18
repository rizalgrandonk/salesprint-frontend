import { ReactNode, ThHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type DataTableHeader<T> = ThHTMLAttributes<HTMLTableCellElement> & {
  render: ((list: T[]) => ReactNode) | ReactNode;
};

export type DataTableCell<T> = ThHTMLAttributes<HTMLTableCellElement> & {
  render: ((item: T) => ReactNode) | ReactNode;
};

export type DataTableProps<T> = {
  list: T[];
  columns: {
    id: string;
    header: DataTableHeader<T>;
    cell: DataTableCell<T>;
  }[];
  isFetching?: boolean;
  containerClassName?: string;
  wrapperClassName?: string;
  tableClassName?: string;
  headClassName?: string;
  bodyClassName?: string;
};

export default function DataTable<T>({
  columns,
  list,
  isFetching,
  containerClassName,
  wrapperClassName,
  tableClassName,
  headClassName,
  bodyClassName,
}: DataTableProps<T>) {
  return (
    <div
      className={twMerge(
        "flex-grow relative overflow-hidden",
        containerClassName
      )}
    >
      {!!isFetching && (
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-900/40 pointer-events-none flex items-center justify-center z-10">
          <div className="px-4 py-2 bg-white border border-gray-200 rounded shadow-sm dark:border-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            Memuat...
          </div>
        </div>
      )}
      <div
        className={twMerge(
          "overflow-auto w-full h-full relative",
          wrapperClassName
        )}
      >
        <table
          className={twMerge(
            "min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600 relative dark:border-gray-600",
            list.length > 0 ? "border-b border-gray-200" : "",
            tableClassName
          )}
        >
          <thead
            className={twMerge(
              "bg-white dark:bg-gray-800 sticky top-0 z-20 shadow-sm",
              headClassName
            )}
          >
            <tr>
              {columns.map((column) => {
                const {
                  className: headerClassName,
                  render: renderHeader,
                  ...headerProps
                } = column.header;
                return (
                  <th
                    key={column.id}
                    {...headerProps}
                    scope="col"
                    className={twMerge(
                      "p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap",
                      headerClassName
                    )}
                  >
                    {typeof renderHeader === "function"
                      ? renderHeader(list)
                      : renderHeader}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody
            className={twMerge(
              "bg-gray-50 dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700",
              bodyClassName
            )}
          >
            {list.length <= 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="w-full flex justify-center items-center py-10 px-4 text-5xl font-semibold text-gray-500">
                    Data Kosong
                  </div>
                </td>
              </tr>
            ) : (
              list.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-white dark:hover:bg-gray-800"
                >
                  {columns.map((column) => {
                    const {
                      className: cellClassName,
                      render: renderCell,
                      ...cellProps
                    } = column.cell;
                    return (
                      <td
                        key={column.id}
                        {...cellProps}
                        className={twMerge(
                          "p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white",
                          cellClassName
                        )}
                      >
                        {typeof renderCell === "function"
                          ? renderCell(item)
                          : renderCell}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
