import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import { useTheme } from "@/contexts/ThemeContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  MdAdd,
  MdAddAPhoto,
  MdAddBox,
  MdOutlineDelete,
  MdWarningAmber,
} from "react-icons/md";
import { z } from "zod";

type VariantType = {
  variantType: string;
  variantOptions: string[];
};

type VariantCombination = {
  [key: string]: string;
  price: string;
  stok: string;
  sku: string;
};

const baseSchema = z.object({
  name: z
    .string({ required_error: "Nama harus diisi" })
    .trim()
    .min(1, "Nama harus diisi")
    .max(50, "Nama tidak boleh lebih dari 50 karakter"),
  description: z
    .string({ required_error: "Deskripsi harus diisi" })
    .trim()
    .min(1, "Deskripsi harus diisi")
    .max(5000, "Deskripsi tidak boleh lebih dari 5000 karakter"),
  category_id: z
    .string({ required_error: "Kategori harus diisi" })
    .trim()
    .min(1, "Kategori harus diisi"),
  weight: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(100000, "Melebihi batas makasimal"),
  length: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(10000, "Melebihi batas makasimal"),
  width: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(10000, "Melebihi batas makasimal"),
  height: z.coerce
    .number({ required_error: "Berat harus diisi" })
    .gt(0, "Kurang dari batas minimal")
    .lt(10000, "Melebihi batas makasimal"),
});

type StringValues<T> = {
  [K in keyof T]: string;
};

type BaseForm = StringValues<z.infer<typeof baseSchema>>;

const defaultBaseForm: BaseForm = {
  name: "",
  category_id: "",
  height: "",
  length: "",
  weight: "",
  width: "",
  description: "",
};

export default function ProductForm() {
  const { isDarkMode } = useTheme();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors: baseErrors },
  } = useForm<BaseForm>({
    resolver: zodResolver(baseSchema),
    mode: "all",
  });

  const [variants, setVariants] = useState<VariantType[]>([]);

  const [variantCombinations, setVariantCombinations] = useState<
    VariantCombination[]
  >([]);

  useEffect(() => {
    setVariantCombinations(generateCombinations(variants));
  }, [variants]);

  const addVariantType = () => {
    return setVariants((prev) => {
      if (prev.length >= 2) {
        return prev;
      }

      return [
        ...prev,
        {
          variantType: "",
          variantOptions: [],
        },
      ];
    });
  };

  const addVariantOption = (typeIndex: number) => {
    return setVariants((prev) =>
      prev.map((item, i) => {
        if (typeIndex === i) {
          return {
            ...item,
            variantOptions: [...(item.variantOptions || []), ""],
          };
        }
        return item;
      })
    );
  };

  const removeVariantType = (typeIndex: number) => {
    return setVariants((prev) => prev.filter((_, i) => i !== typeIndex));
  };

  const removeVariantOption = (typeIndex: number, optIndex: number) => {
    return setVariants((prev) =>
      prev.map((item, i) => {
        if (typeIndex === i) {
          return {
            ...item,
            variantOptions: (item.variantOptions || []).filter(
              (_, i) => i !== optIndex
            ),
          };
        }
        return item;
      })
    );
  };

  const onChangeVariantType = (value: string, typeIndex: number) => {
    // if (value === "") {
    //   return removeVariantType(typeIndex);
    // }

    return setVariants((prev) =>
      prev.map((item, i) => {
        if (typeIndex === i) {
          return {
            ...item,
            variantType: value ?? "",
          };
        }
        return item;
      })
    );
  };

  const onChangeVariantOption = (
    value: string,
    typeIndex: number,
    optIndex: number
  ) => {
    // if (value === "") {
    //   return removeVariantOption(typeIndex, optIndex);
    // }

    return setVariants((prev) =>
      prev.map((item, i) => {
        if (typeIndex === i) {
          return {
            ...item,
            variantOptions: item.variantOptions?.map((opt, optI) => {
              if (optIndex === optI) {
                return value;
              }
              return opt;
            }),
          };
        }
        return item;
      })
    );
  };

  return (
    <form className="space-y-2 lg:space-y-4">
      <BaseCard className="space-y-4">
        <h2 className="text-xl font-semibold">Informasi Dasar</h2>
        <div className="space-y-4">
          <FormInput
            {...register("name")}
            type="text"
            id="name"
            name="name"
            label="Nama produk"
            placeholder="Masukan nama produk anda"
            className="text-sm px-2 py-1.5"
            error={baseErrors.name?.message}
            errorClassName="text-xs"
          />
          <FormSelect
            {...register("category_id")}
            id="category_id"
            name="category_id"
            label="Kategori produk"
            placeholder="Pilih kategori"
            className="text-sm px-2 py-1.5"
            options={[]}
            error={baseErrors.category_id?.message}
            errorClassName="text-xs"
          />

          <div className="space-y-1">
            <label htmlFor="product_images">Foto Produk</label>
            <div className="p-4 flex items-center gap-4 bg-gray-100 dark:bg-gray-900">
              <div className="w-20 h-20 rounded border border-dashed border-gray-500 flex justify-center items-center cursor-pointer group">
                <MdAdd className="text-6xl text-gray-500 group-hover:text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="main_image">Gambar Utama</label>
            <div className="p-4 flex items-center gap-4 bg-gray-100 dark:bg-gray-900 lg:w-1/2">
              <div className="w-20 h-20 rounded border border-dashed border-gray-500 flex justify-center items-center cursor-pointer group">
                <MdAdd className="text-6xl text-gray-500 group-hover:text-primary" />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard className="space-y-4">
        <h2 className="text-xl font-semibold">Harga, Stok & Varian</h2>

        {!!variants &&
          variants.map((variant, typeIndex) => {
            const variantOptions = variant.variantOptions;
            return (
              <div
                key={typeIndex}
                className="px-4 py-3 rounded bg-gray-100 dark:bg-gray-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Varian {typeIndex + 1}</h3>
                  <MdOutlineDelete
                    className="text-xl opacity-60 cursor-pointer hover:opacity-100"
                    onClick={() => removeVariantType(typeIndex)}
                  />
                </div>

                <FormInput
                  type="text"
                  id="variant_type"
                  name="variant_type"
                  label="Tipe varian"
                  placeholder="Masukan tipe varian anda"
                  className="text-sm px-2 py-1.5 bg-white dark:bg-gray-800"
                  value={variant.variantType}
                  onChange={(e) =>
                    onChangeVariantType(e.target.value, typeIndex)
                  }
                />

                <div className="space-y-1">
                  <label htmlFor="parice_stock">Opsi pilihan varian</label>
                  <div className="space-y-2">
                    {variantOptions?.map((opt, optIndex) => (
                      <BaseCard
                        key={optIndex}
                        className="flex items-center justify-between"
                      >
                        <FormInput
                          type="text"
                          id="variant_option"
                          name="variant_option"
                          placeholder="Masukan opsi varian anda"
                          className="text-sm px-2 py-1.5 bg-white dark:bg-gray-800"
                          value={opt}
                          onChange={(e) =>
                            onChangeVariantOption(
                              e.target.value,
                              typeIndex,
                              optIndex
                            )
                          }
                        />
                        <MdOutlineDelete
                          onClick={() =>
                            removeVariantOption(typeIndex, optIndex)
                          }
                          className="text-xl opacity-60 cursor-pointer hover:opacity-100"
                        />
                      </BaseCard>
                    ))}

                    <Button
                      onClick={() => addVariantOption(typeIndex)}
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      Tambah Opsi
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

        <Button variant="outline" type="button" onClick={addVariantType}>
          Tambah Varian
        </Button>

        <div className="space-y-1">
          <label htmlFor="parice_stock">Harga & Stok</label>

          <table className="min-w-full border border-gray-200 dark:border-gray-600 border-collapse table-fixed relative">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                {variants.map((variant) => (
                  <th
                    key={variant.variantType}
                    className="p-3 text-sm font-medium text-center text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-gray-600"
                  >
                    {variant.variantType}
                  </th>
                ))}
                <th className="p-3 text-sm font-medium text-center text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-gray-600">
                  Harga
                </th>
                <th className="p-3 text-sm font-medium text-center text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-gray-600">
                  Stok
                </th>
                <th className="p-3 text-sm font-medium text-center text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-gray-600">
                  SKU
                </th>
              </tr>
            </thead>
            <tbody>
              {variantCombinations.map((comb, idx) => (
                <tr key={idx}>
                  {variants.map((variant) => (
                    <td
                      key={variant.variantType + idx}
                      className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      {comb[variant.variantType] ?? ""}
                    </td>
                  ))}
                  <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600">
                    <FormInput
                      type="number"
                      id="price"
                      name="price"
                      placeholder="Masukan tinggi produk anda"
                      className="text-sm px-2 py-1.5"
                      leftEl="Rp"
                    />
                  </td>
                  <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600">
                    <FormInput
                      type="number"
                      id="stok"
                      name="stok"
                      placeholder="Masukan tinggi produk anda"
                      className="text-sm px-2 py-1.5"
                    />
                  </td>
                  <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600">
                    <FormInput
                      type="text"
                      id="variant_sku"
                      name="variant_sku"
                      placeholder="Masukan tinggi produk anda"
                      className="text-sm px-2 py-1.5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BaseCard>

      <BaseCard className="space-y-4">
        <h2 className="text-xl font-semibold">Deskripis Produk</h2>
        <div className="space-y-1">
          <label htmlFor="description">Deskripis</label>
          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Editor
                key={isDarkMode ? "dark" : "light"}
                apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                init={{
                  height: 500,
                  menubar: true,
                  plugins:
                    "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount",
                  toolbar:
                    "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | removeformat | help",
                  skin: isDarkMode ? "oxide-dark" : undefined,
                  content_css: isDarkMode ? "dark" : undefined,
                }}
                value={value}
                onEditorChange={(value) => onChange(value)}
              />
            )}
          />
          {!!baseErrors.description?.message && (
            <span className="text-xs text-rose-500 inline-flex items-center gap-1">
              <MdWarningAmber />
              {baseErrors.description.message}
            </span>
          )}
        </div>
      </BaseCard>

      <BaseCard className="space-y-4">
        <h2 className="text-xl font-semibold">Dimensi Produk</h2>
        <div className="space-y-4">
          <FormInput
            {...register("weight")}
            type="number"
            id="weight"
            name="weight"
            label="Berat produk (gram)"
            placeholder="Masukan berat produk anda"
            className="text-sm px-2 py-1.5"
            rightEl="gram"
            error={baseErrors.weight?.message}
          />
          <div className="space-y-1">
            <label htmlFor="dimension">
              Panjang (cm) * Lebar (cm) * Tinggi (cm)
            </label>
            <div className="flex items-center gap-3">
              <FormInput
                {...register("length")}
                type="number"
                id="length"
                name="length"
                placeholder="Masukan panjang produk anda"
                className="text-sm px-2 py-1.5"
                rightEl="cm"
                error={baseErrors.length?.message}
                errorClassName="hidden"
              />
              <span>x</span>
              <FormInput
                {...register("width")}
                type="number"
                id="width"
                name="width"
                placeholder="Masukan lebar produk anda"
                className="text-sm px-2 py-1.5"
                rightEl="cm"
                error={baseErrors.width?.message}
                errorClassName="hidden"
              />
              <span>x</span>
              <FormInput
                {...register("height")}
                type="number"
                id="height"
                name="height"
                placeholder="Masukan tinggi produk anda"
                className="text-sm px-2 py-1.5"
                rightEl="cm"
                error={baseErrors.height?.message}
                errorClassName="hidden"
              />
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard className="flex items-center justify-end gap-4">
        <Button variant="outline">Simpan Draft</Button>
        <Button type="submit">Submit</Button>
      </BaseCard>
    </form>
  );
}

function generateCombinations(
  variantTypes: VariantType[]
): VariantCombination[] {
  const result: VariantCombination[] = [];

  // Helper function to recursively generate combinations
  function generateCombination(
    index: number,
    currentCombination: VariantCombination
  ): void {
    if (index === variantTypes.length) {
      result.push({ ...currentCombination, price: "", stok: "", sku: "" });
      return;
    }

    const currentType = variantTypes[index];

    for (const option of currentType.variantOptions) {
      generateCombination(index + 1, {
        ...currentCombination,
        [currentType.variantType]: option,
      });
    }
  }

  // Start generating combinations
  generateCombination(0, {} as VariantCombination);

  return result;
}
