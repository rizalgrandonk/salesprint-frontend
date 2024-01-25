import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import FormInput from "@/components/utils/FormInput";
import FormSelect from "@/components/utils/FormSelect";
import QueryKeys from "@/constants/queryKeys";
import { useTheme } from "@/contexts/ThemeContext";
import { getAllCategories } from "@/lib/api/categories";
import { deleteProductImage } from "@/lib/api/products";
import { getStoreCategories } from "@/lib/api/storeCategories";
import toast from "@/lib/toast";
import {
  BaseForm,
  VariantCombination,
  VariantType,
  baseSchema,
} from "@/types/Product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { MdAdd, MdOutlineDelete, MdWarningAmber } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import Alerts from "../utils/Alerts";

export type ProductData = BaseForm & {
  images: (File | string)[];
  main_image: File | string;
  variants: VariantType[];
  variant_combinations: VariantCombination[];
};

type ProductFormProps = {
  className?: string;
  storeSlug: string;
  productSlug?: string;
  defaultData?: ProductData;
  isLoadingRequest?: boolean;
  onSubmit?: (formData: ProductData) => void;
};

export default function ProductForm({
  className,
  onSubmit,
  storeSlug,
  productSlug,
  isLoadingRequest = false,
  defaultData,
}: ProductFormProps) {
  const { isDarkMode } = useTheme();
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const {
    images: defaultImages,
    main_image: defaultMainImage,
    variants: defaultVariants,
    variant_combinations: defaultVariantCombinations,
    ...defaultBaseForm
  } = defaultData ?? {};

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors: baseErrors },
  } = useForm<BaseForm>({
    resolver: zodResolver(baseSchema),
    mode: "all",
    defaultValues: defaultBaseForm,
  });

  const {
    category_id: currentCategoryId,
    store_category_id: currentStoreCategoryId,
  } = watch();

  const { data: categories, error: errorCategories } = useQuery({
    queryKey: [QueryKeys.ALL_CATEGORIES],
    queryFn: () => getAllCategories(),
  });

  const { data: storeCategories, error: errorStoreCategories } = useQuery({
    queryKey: [QueryKeys.STORE_CATEGORIES, storeSlug],
    queryFn: () => (storeSlug ? getStoreCategories(storeSlug) : null),
    enabled: !!storeSlug,
  });

  const [variants, setVariants] = useState<VariantType[]>(
    defaultVariants ?? []
  );

  const [variantCombinations, setVariantCombinations] = useState<
    VariantCombination[]
  >(defaultVariantCombinations ?? []);

  const [images, setImages] = useState<(File | string)[]>(defaultImages ?? []);
  const [mainImage, setMainImages] = useState<File | string | null>(
    defaultMainImage ?? null
  );

  const [formErrors, setFormErrors] = useState({
    variant: "",
    combination: "",
    images: "",
    mainImage: "",
  });

  useEffect(() => {
    // if (variants.length <= 0) {
    //   setVariantCombinations([
    //     {
    //       price: "",
    //       sku: "",
    //       stok: "",
    //     },
    //   ]);
    // }
    setVariantCombinations((prev) => generateCombinations(variants, prev));
  }, [variants]);

  const addVariantType = () => {
    return setVariants((prev) => {
      if (prev.length >= 2) {
        return prev;
      }

      return [
        ...prev,
        {
          variant_type: "",
          variant_options: [],
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
            variant_options: [...(item.variant_options || []), ""],
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
            variant_options: (item.variant_options || []).filter(
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
            variant_type: value ?? "",
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
            variant_options: item.variant_options?.map((opt, optI) => {
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

  const onChangeVariantComb = (field: string, value: string, index: number) => {
    return setVariantCombinations((prev) =>
      prev.map((comb, i) => {
        if (index === i) {
          return {
            ...comb,
            [field]: value,
          };
        }
        return comb;
      })
    );
  };

  const onFormSubmit: SubmitHandler<BaseForm> = async (data) => {
    if (images.length <= 0) {
      setFormErrors((prev) => ({
        ...prev,
        images: "Gambar produk harus diisi",
      }));
      return null;
    }
    setFormErrors((prev) => ({
      ...prev,
      images: "",
    }));

    if (!mainImage) {
      setFormErrors((prev) => ({
        ...prev,
        mainImage: "Gambar utama harus diisi",
      }));
      return null;
    }
    setFormErrors((prev) => ({
      ...prev,
      mainImage: "",
    }));

    if (variants.length > 0) {
      const isAllVariantFilled = variants.every((type) =>
        Object.values(type).every((val) => !!val && val !== "")
      );
      if (!isAllVariantFilled) {
        setFormErrors((prev) => ({
          ...prev,
          variant: "Semua varian input harus diisi",
        }));
        return null;
      }
      setFormErrors((prev) => ({
        ...prev,
        variant: "",
      }));
    }

    if (variantCombinations.length > 0) {
      const isAllCombFilled = variantCombinations.every((comb) =>
        Object.values(comb).every((val) => !!val && val !== "")
      );
      if (!isAllCombFilled) {
        setFormErrors((prev) => ({
          ...prev,
          combination: "Semua varian input harus diisi",
        }));
        return null;
      }
      setFormErrors((prev) => ({
        ...prev,
        combination: "",
      }));
    }

    onSubmit &&
      onSubmit({
        ...data,
        images: images,
        main_image: mainImage,
        variants: variants,
        variant_combinations: variantCombinations,
      });
    return;
  };

  if (errorCategories) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Error Loading Categories
      </Alerts>
    );
  }
  if (errorStoreCategories) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Error Loading Store Categories
      </Alerts>
    );
  }

  return (
    <form
      className={twMerge("space-y-2 lg:space-y-4", className)}
      onSubmit={handleSubmit(onFormSubmit)}
    >
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
            classNameError="text-xs"
          />
          <FormSelect
            {...register("category_id")}
            value={currentCategoryId}
            id="category_id"
            name="category_id"
            label="Kategori produk"
            placeholder="Pilih kategori"
            className="text-sm px-2 py-1.5"
            options={categories?.map((category) => ({
              title: category.name,
              value: category.id,
            }))}
            error={baseErrors.category_id?.message}
            classNameError="text-xs"
          />
          <FormSelect
            {...register("store_category_id")}
            value={currentStoreCategoryId ?? undefined}
            id="store_category_id"
            name="store_category_id"
            label="Etalase Produk (opsional)"
            placeholder="Pilih etalase (opsional)"
            className="text-sm px-2 py-1.5"
            options={storeCategories?.map((category) => ({
              title: category.name,
              value: category.id,
            }))}
            error={baseErrors.store_category_id?.message}
            classNameError="text-xs"
          />

          <div className="space-y-1">
            <label htmlFor="product_images">Foto Produk</label>
            <div className="p-4 flex items-center gap-4 bg-gray-100 dark:bg-gray-900">
              {images.map((image, index) => (
                <div
                  key={`image_${index}`}
                  className="w-20 h-20 rounded relative group"
                >
                  <Image
                    src={getImagePreview(image)}
                    alt={"Gambar produk"}
                    fill
                    sizes="5rem"
                    loading="lazy"
                    className="object-cover rounded"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black/50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                    {!isLoadingRequest && (
                      <MdOutlineDelete
                        className="text-2xl opacity-60 cursor-pointer hover:opacity-100"
                        onClick={() =>
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
              <ImageInput
                disabled={isLoadingRequest}
                className="w-20 h-20 rounded"
                onChange={(file) => setImages((prev) => [...prev, file])}
              />
            </div>

            {!!formErrors.images && (
              <div>
                <span className="text-xs text-rose-500 inline-flex items-center gap-1">
                  <MdWarningAmber />
                  {formErrors.images}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="main_image">Gambar Utama</label>
            <div className="p-4 flex items-center gap-4 bg-gray-100 dark:bg-gray-900 lg:w-1/2">
              {!!mainImage && (
                <div className="w-20 h-20 rounded relative group">
                  <Image
                    src={getImagePreview(mainImage)}
                    alt={"Gambar produk"}
                    fill
                    sizes="5rem"
                    loading="lazy"
                    className="object-cover rounded"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black/50 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                    {!isLoadingRequest && (
                      <MdOutlineDelete
                        className="text-2xl opacity-60 cursor-pointer hover:opacity-100"
                        onClick={() => setMainImages(null)}
                      />
                    )}
                  </div>
                </div>
              )}
              {!mainImage && (
                <ImageInput
                  disabled={isLoadingRequest}
                  className="w-20 h-20 rounded"
                  onChange={(file) => setMainImages((prev) => prev ?? file)}
                />
              )}
            </div>

            {!!formErrors.mainImage && (
              <div>
                <span className="text-xs text-rose-500 inline-flex items-center gap-1">
                  <MdWarningAmber />
                  {formErrors.mainImage}
                </span>
              </div>
            )}
          </div>
        </div>
      </BaseCard>

      <BaseCard className="space-y-4">
        <h2 className="text-xl font-semibold">Harga, Stok & Varian</h2>

        {!!variants &&
          variants.map((variant, typeIndex) => {
            const variant_options = variant.variant_options;
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
                  value={variant.variant_type}
                  onChange={(e) =>
                    onChangeVariantType(e.target.value, typeIndex)
                  }
                  error={
                    !!formErrors.variant &&
                    (!variant.variant_type || variant.variant_type === "")
                      ? "Tipe varian harus diisi"
                      : undefined
                  }
                  classNameError="text-xs"
                />

                <div className="space-y-1">
                  <label htmlFor="parice_stock">Opsi pilihan varian</label>
                  <div className="space-y-2">
                    {variant_options?.map((opt, optIndex) => (
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
                          error={
                            !!formErrors.variant && (!opt || opt === "")
                              ? "Opsi varian harus diisi"
                              : undefined
                          }
                          classNameError="text-xs"
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
                      variant="base"
                      outline
                      size="sm"
                    >
                      Tambah Opsi
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

        {!!formErrors.variant && (
          <div>
            <span className="text-xs text-rose-500 inline-flex items-center gap-1">
              <MdWarningAmber />
              {formErrors.variant}
            </span>
          </div>
        )}

        {variants.length < 2 && (
          <Button variant="base" outline type="button" onClick={addVariantType}>
            Tambah Varian
          </Button>
        )}

        <div className="space-y-1">
          <label htmlFor="parice_stock">Harga & Stok</label>

          <table className="min-w-full border border-gray-200 dark:border-gray-600 border-collapse table-fixed relative">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                {variants
                  .filter(
                    (variant) =>
                      variant.variant_type &&
                      variant.variant_type !== "" &&
                      variant.variant_options.length > 0 &&
                      !variant.variant_options.some((opt) => opt && opt === "")
                  )
                  .map((variant) => (
                    <th
                      key={variant.variant_type}
                      className="p-3 text-sm font-medium text-center text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap border border-gray-200 dark:border-gray-600"
                    >
                      {variant.variant_type}
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
                      key={variant.variant_type + idx}
                      className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600 text-center"
                    >
                      {comb[variant.variant_type] ?? ""}
                    </td>
                  ))}
                  <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600">
                    <FormInput
                      type="number"
                      id="price"
                      name="price"
                      placeholder="Masukan tinggi produk anda"
                      className="text-sm px-2 py-1.5"
                      elementLeft="Rp"
                      value={comb.price}
                      onChange={(e) =>
                        onChangeVariantComb("price", e.target.value, idx)
                      }
                      error={
                        !!formErrors.combination &&
                        (!comb.price || comb.price === "")
                          ? "Tipe varian harus diisi"
                          : undefined
                      }
                      classNameError="text-xs hidden"
                    />
                  </td>
                  <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600">
                    <FormInput
                      type="number"
                      id="stok"
                      name="stok"
                      placeholder="Masukan tinggi produk anda"
                      className="text-sm px-2 py-1.5"
                      value={comb.stok}
                      onChange={(e) =>
                        onChangeVariantComb("stok", e.target.value, idx)
                      }
                      error={
                        !!formErrors.combination &&
                        (!comb.price || comb.price === "")
                          ? "Tipe varian harus diisi"
                          : undefined
                      }
                      classNameError="text-xs hidden"
                    />
                  </td>
                  <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white border border-gray-200 dark:border-gray-600">
                    <FormInput
                      type="text"
                      id="variant_sku"
                      name="variant_sku"
                      placeholder="Masukan tinggi produk anda"
                      className="text-sm px-2 py-1.5"
                      value={comb.sku}
                      onChange={(e) =>
                        onChangeVariantComb("sku", e.target.value, idx)
                      }
                      error={
                        !!formErrors.combination &&
                        (!comb.price || comb.price === "")
                          ? "Tipe varian harus diisi"
                          : undefined
                      }
                      classNameError="text-xs hidden"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!!formErrors.variant && (
            <div>
              <span className="text-xs text-rose-500 inline-flex items-center gap-1">
                <MdWarningAmber />
                {formErrors.combination}
              </span>
            </div>
          )}
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
                  height: 300,
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
            elementRight="gram"
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
                elementRight="cm"
                error={baseErrors.length?.message}
                classNameError="hidden"
              />
              <span>x</span>
              <FormInput
                {...register("width")}
                type="number"
                id="width"
                name="width"
                placeholder="Masukan lebar produk anda"
                className="text-sm px-2 py-1.5"
                elementRight="cm"
                error={baseErrors.width?.message}
                classNameError="hidden"
              />
              <span>x</span>
              <FormInput
                {...register("height")}
                type="number"
                id="height"
                name="height"
                placeholder="Masukan tinggi produk anda"
                className="text-sm px-2 py-1.5"
                elementRight="cm"
                error={baseErrors.height?.message}
                classNameError="hidden"
              />
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard className="flex items-center justify-end gap-4">
        {/* <Button type="button" variant="outline">
          Simpan Draft
        </Button> */}
        <Button
          type="submit"
          isLoading={isLoadingRequest}
          disabled={isLoadingRequest}
        >
          Submit
        </Button>
      </BaseCard>
    </form>
  );
}

type ImageInputProps = {
  className?: string;
  onChange?: (file: File) => void;
  disabled?: boolean;
};

function ImageInput({ className, onChange, disabled }: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange && onChange(file);
    }
  };

  return (
    <>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={twMerge(
          "w-20 h-20 rounded border border-dashed border-gray-500 flex justify-center items-center group",
          !disabled ? "cursor-pointer" : "cursor-not-allowed",
          className
        )}
      >
        <MdAdd
          className={twMerge(
            "text-6xl text-gray-500",
            !disabled ? "group-hover:text-primary" : ""
          )}
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        name="file-image"
        id="file-image"
        accept="image/png, image/gif, image/jpeg"
        hidden
        disabled={disabled}
        onChange={handleFileImageChange}
      />
    </>
  );
}

function getImagePreview(image: File | string) {
  if (typeof image === "string") {
    return image;
  }
  return URL.createObjectURL(image);
}

function generateCombinations(
  variantTypes: VariantType[],
  prevComb: VariantCombination[]
): VariantCombination[] {
  const result: VariantCombination[] = [];
  const variants = variantTypes.filter(
    (variant) =>
      variant.variant_type &&
      variant.variant_type !== "" &&
      variant.variant_options.length > 0 &&
      !variant.variant_options.some((opt) => opt && opt === "")
  );

  // Helper function to recursively generate combinations
  function generateCombination(
    index: number,
    currentCombination: VariantCombination
  ): void {
    if (index === variants.length) {
      result.push({
        ...currentCombination,
        price: "",
        stok: "",
        sku: "",
      });
      return;
    }

    const currentType = variants[index];

    for (const option of currentType.variant_options) {
      generateCombination(index + 1, {
        ...currentCombination,
        [currentType.variant_type]: option,
      });
    }
  }

  // Start generating combinations
  generateCombination(0, {} as VariantCombination);

  console.log({
    variantTypes,
    variants,
    prevComb,
    result,
  });

  return result.map((res, i) => ({
    ...res,
    sku: prevComb?.[i]?.sku ?? "",
    stok: prevComb?.[i]?.stok ?? "",
    price: prevComb?.[i]?.price ?? "",
  }));
}

// const formData = {
//   name: "String name",
//   description: "String deskription",
//   category_id: "String category_id",
//   weight: 10, // Number weight
//   length: 10, // Number length
//   width: 10, // Number width
//   height: 10, // Number height
//   images: [File, File], // Array of File
//   main_image: File,
//   variant: [
//     {
//       vatiantType: "Warna",
//       variant_options: ["Black", "White"],
//     },
//     {
//       vatiantType: "Ukuran",
//       variant_options: ["M", "L"],
//     },
//   ],
//   variant_combinations: [
//     {
//       price: 1000,
//       stok: 10,
//       sku: "QWE",
//       Warna: "Black",
//       Ukuran: "M",
//     },
//     {
//       price: 1000,
//       stok: 10,
//       sku: "QWE",
//       Warna: "Black",
//       Ukuran: "L",
//     },
//     {
//       price: 1000,
//       stok: 10,
//       sku: "QWE",
//       Warna: "White",
//       Ukuran: "M",
//     },
//     {
//       price: 1000,
//       stok: 10,
//       sku: "QWE",
//       Warna: "White",
//       Ukuran: "L",
//     },
//   ],
// };
