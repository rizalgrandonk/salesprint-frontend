import BaseCard from "@/components/utils/BaseCard";
import { Button } from "@/components/utils/Button";
import Meta from "@/components/utils/Meta";
import ProductRating from "@/components/utils/ProductRating";
import QueryKeys from "@/constants/queryKeys";
import useDataTable from "@/hooks/useDataTable";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_USER_IMAGE,
} from "@/lib/constants";
import { Review } from "@/types/Product";
import { MakePropertiesRequired } from "@/types/data";
import { format } from "date-fns/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function UserReviewsPage() {
  const { data: session } = useSession();

  const userData = session?.user;

  return (
    <>
      <Meta title="Ulasan | Salesprint" />
      <div className="py-8 container flex gap-6 items-start">
        <BaseCard className="hidden lg:block p-0 flex-shrink-0 w-80 sticky top-28 divide-y divide-gray-200 dark:divide-gray-700">
          <div className="px-4 py-3 flex items-center gap-4">
            <div className="relative h-14 aspect-square rounded-full overflow-hidden">
              <Image
                src={userData?.image || DEFAULT_USER_IMAGE}
                alt={userData?.username ?? ""}
                fill
                loading="lazy"
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold my-0 leading-none">
                {userData?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 my-0 leading-none">
                {userData?.email}
              </p>
            </div>
          </div>
          <ul className="py-3" role="none">
            <li>
              <Link
                href={"/user/orders"}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Pesanan
              </Link>
            </li>
            <li>
              <Link
                href={`/user/profile`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Profil
              </Link>
            </li>
            <li>
              <Link
                href={`/user/reviews`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                role="menuitem"
              >
                Ulasan
              </Link>
            </li>
          </ul>
        </BaseCard>

        <div className="flex-grow space-y-4 overflow-x-hidden">
          <h1 className="font-semibold text-2xl">Ulasan Anda</h1>
          <ReviewSection />
        </div>
      </div>
    </>
  );
}

function ReviewSection() {
  const { data: session } = useSession();

  const userData = session?.user;
  const userId = userData?.id;
  const userToken = userData?.access_token;

  const {
    data: reviews,
    queryState,
    nextPage,
    previousPage,
    setFilter,
    refetch,
  } = useDataTable<
    MakePropertiesRequired<Review, "product" | "product_variant" | "order_item">
  >(
    QueryKeys.PAGINATED_USER_REVIEWS,
    {
      orderBy: {
        field: "created_at",
        value: "desc",
      },
      limit: 5,
      with: [
        "product",
        "product.store",
        "product.product_images",
        "product_variant.variant_options",
        "order_item",
        "order_item.order",
      ],
    },
    {
      enabled: !!userToken,
      token: userToken,
      queryKey: [QueryKeys.PAGINATED_USER_REVIEWS, userToken],
    }
  );

  return (
    <BaseCard className="w-full p-0 divide-y divide-gray-300 dark:divide-gray-600">
      {!reviews || reviews.length <= 0 ? (
        <p className="px-3 py-4 text-3xl text-center">Tidak ada data</p>
      ) : (
        <>
          {reviews.map((review) => {
            return (
              <div key={review.id} className="py-5 px-4 space-y-2">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 aspect-square rounded-sm overflow-hidden">
                    <Image
                      src={
                        review.product?.product_images?.find(
                          (image) => image.main_image
                        )?.image_url ||
                        review.product?.product_images?.[0]?.image_url ||
                        DEFAULT_STORE_CATEGORY_IMAGE
                      }
                      alt={review.product?.name ?? ""}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm my-0 leading-none">
                      {review.product.name}
                    </p>
                    <p className="text-xs my-0 leading-none text-gray-500 dark:text-gray-400">
                      {review.product_variant?.variant_options
                        ?.map((opt) => opt.value)
                        .join(", ")}
                    </p>
                    <ProductRating className="text-xs" rating={review.rating} />
                    <p className="text-xs my-0 leading-none text-gray-500 dark:text-gray-400">
                      {format(new Date(review.created_at), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm">{review.coment}</p>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              onClick={() => {
                !!previousPage && previousPage();
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              }}
              size="sm"
              variant="primary"
              outline
              disabled={!previousPage}
            >
              <MdChevronLeft className="text-xl" />
              <span>Sebelumnya</span>
            </Button>
            <span>{queryState.page}</span>
            <Button
              onClick={() => {
                !!nextPage && nextPage();
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              }}
              size="sm"
              variant="primary"
              outline
              disabled={!nextPage}
            >
              <span>Berikutnya</span>
              <MdChevronRight className="text-xl" />
            </Button>
          </div>
        </>
      )}
    </BaseCard>
  );
}
