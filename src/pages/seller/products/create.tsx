import ProductForm from "@/components/dashboard/ProductForm";
import Breadcrumb from "@/components/utils/Breadcrumb";

export default function CreateProductPage() {
  return (
    <div className="px-3 lg:px-5 pt-1 pb-6 space-y-2 lg:space-y-4">
      <div className="space-y-3">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/seller",
            },
            {
              title: "Produk",
              href: "/seller/products",
            },
            {
              title: "Tambah Produk",
              href: "/seller/products/create",
            },
          ]}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Buat Produk Baru
          </h1>
        </div>
      </div>

      <ProductForm
        onSubmit={async (formData) => {
          console.log(formData);
        }}
      />
    </div>
  );
}
