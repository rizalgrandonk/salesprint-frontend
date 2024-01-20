import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import { ButtonLink } from "@/components/utils/Button";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import QueryKeys from "@/constants/queryKeys";
import { getUserStore } from "@/lib/api/stores";
import {
  DEFAULT_STORE_CATEGORY_IMAGE,
  DEFAULT_STORE_IMAGE,
} from "@/lib/constants";
import { StoreBanner } from "@/types/Store";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MdModeEdit } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import Carousel, { ArrowProps } from "react-multi-carousel";

export default function SellerStore() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_STORE, userId],
    queryFn: () =>
      getUserStore(userToken, {
        with: ["store_banners", "store_categories"],
      }),
    enabled: !!userId && !!userToken,
  });

  if (isLoading) {
    return (
      <div className="w-full px-28 py-44">
        <LoadingSpinner />
      </div>
    );
  }

  if (!store) {
    return (
      <Alerts variant="danger">
        <RiInformationLine className="text-lg" />
        Store data not found
      </Alerts>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 px-3 lg:px-5 py-1">
      <div className="col-span-full space-y-3">
        <Breadcrumb
          navList={[
            {
              title: "Beranda",
              href: "/seller",
            },
            {
              title: "Toko",
              href: "/seller/store",
            },
          ]}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Halaman & Info Toko
          </h1>
          <ButtonLink size="sm" variant="primary" href="/seller/store/settings">
            <MdModeEdit className="text-base" />
            <span>Ubah info toko</span>
          </ButtonLink>
        </div>
      </div>

      <div className="col-span-full lg:col-auto flex flex-col gap-2 lg:gap-4">
        <BaseCard className="space-y-2 flex-grow">
          <div className="flex gap-3">
            <div className="w-32 h-32 relative">
              <Image
                src={store.image || DEFAULT_STORE_IMAGE}
                alt=""
                fill
                sizes="8rem"
                loading="lazy"
                className="object-cover rounded"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <span className="inline-block bg-green-100 text-green-800 font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 uppercase">
                {store.status}
              </span>
            </div>
          </div>
          {store.store_description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-normal">
              {store.store_description}
            </p>
          )}
        </BaseCard>

        <BaseCard className="space-y-4 flex-grow">
          <h2 className="text-xl font-semibold">Alamat Toko</h2>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Alamat
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.address}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Kota
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.city}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Provinsi
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.province}
              </p>
            </div>
          </div>
        </BaseCard>
      </div>

      <div className="coll-span-full lg:col-span-2 flex flex-col gap-2 lg:gap-4">
        <BaseCard className="space-y-4 flex-grow">
          <h2 className="text-xl font-semibold">Banner Toko</h2>

          {store.store_banners && store.store_banners.length > 0 ? (
            <BannerCarousel store_banners={store.store_banners} />
          ) : (
            <div>Tidak ada banner</div>
          )}
        </BaseCard>

        <BaseCard className="space-y-4 flex-grow">
          <h2 className="text-xl font-semibold">Katagori Toko </h2>

          {store.store_categories && store.store_categories.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-3">
              {store.store_categories.map((category) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 w-[10rem] space-y-1 border rounded overflow-hidden border-gray-300 dark:border-gray-700"
                >
                  <div className="w-full aspect-video relative">
                    <Image
                      src={category.image || DEFAULT_STORE_CATEGORY_IMAGE}
                      alt={category.name}
                      fill
                      sizes="25vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <div className="font-medium text-sm p-1 text-center">
                    {category.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>Tidak ada kategori toko</div>
          )}
        </BaseCard>
      </div>
    </div>
  );
}

type BannerCarouselProps = {
  store_banners: StoreBanner[];
};

function BannerCarousel({ store_banners }: BannerCarouselProps) {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  return (
    <div className="relative">
      <Carousel
        draggable
        swipeable
        responsive={responsive}
        showDots={false}
        autoPlay={false}
        removeArrowOnDeviceType={["tablet", "mobile"]}
        autoPlaySpeed={5000}
        arrows={true}
        infinite
      >
        {store_banners.map((banner) => (
          <div key={banner.id} className="w-full h-60 relative">
            <Image
              src={banner.image}
              alt=""
              fill
              sizes="50vh"
              loading="lazy"
              className="object-cover rounded"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
