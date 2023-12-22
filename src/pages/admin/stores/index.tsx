import DataTable from "@/components/dashboard/DataTable";
import Alerts from "@/components/utils/Alerts";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import { getPaginatedStores } from "@/lib/api/stores";
import { DEFAULT_USER_IMAGE } from "@/lib/constants";
import { Store } from "@/types/Store";
import { QueryState } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { RiInformationLine } from "react-icons/ri";

const limitOptions = [10, 20, 30, 50, 100].map((limit) => ({
  title: limit.toString(),
  value: limit.toString(),
}));

const defaultQueryState: QueryState<Store> = {
  limit: 10,
  current_page: 1,
  withCount: ["store_categories", "products"],
  orderBy: {
    field: "name",
    value: "asc",
  },
};

export default function StoreListPage() {
  const [queryState, setQueryState] = useState(defaultQueryState);

  const { data: storeData, isLoading } = useQuery({
    queryKey: [QueryKeys.PAGINATED_STORES, queryState],
    queryFn: () => getPaginatedStores(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!storeData) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  return (
    <div className="space-y-2 lg:space-y-4 flex flex-col h-[88vh]">
      <div className="col-span-full space-y-2 lg:space-y-4 px-3 lg:px-5 py-1">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/admin",
            },
            {
              title: "Daftar Toko",
              href: "/admin/stores",
            },
          ]}
        />

        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Daftar Toko
        </h1>

        <div className="flex flex-col lg:flex-row gap-2 justify-between items-center">
          <FormInput
            className="text-sm w-80"
            id="category-search"
            placeholder="Cari Etalase"
            // value={searchKey}
            // onChange={(e) => setSearchKey(e.target.value)}
          />
          {/* <Button
              onClick={() => toggleModalOpen(null)}
              size="sm"
              variant="primary"
              href="#"
            >
              <MdAdd className="text-base" />
              <span>Tambah Kategori Baru</span>
            </Button> */}
        </div>
      </div>

      <DataTable
        list={storeData.data}
        headers={[
          {
            id: "name",
            render: "Nama Toko",
          },
          {
            id: "status",
            render: "Status",
          },
        ]}
        columns={[
          {
            id: "name",
            render: (item) => item.name,
          },
          {
            id: "status",
            render: (item) => item.status,
          },
        ]}
      />

      <div className="flex justify-between items-center px-3 lg:px-5 py-1">
        <div>
          <FormSelect
            className="text-xs w-20"
            id="table-limit"
            options={limitOptions}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm">Previous</Button>
          <Button size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
