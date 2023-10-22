import Alerts from "@/components/utils/Alerts";
import BaseCard from "@/components/utils/BaseCard";
import Breadcrumb from "@/components/utils/Breadcrumb";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import { getUserStore } from "@/lib/api/store";
import { StoreBanner } from "@/types/Store";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { RiInformationLine } from "react-icons/ri";
import Carousel, { ArrowProps } from "react-multi-carousel";

export default function SellerStore() {
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const userToken = session?.user?.access_token;

  const { data: store, isLoading } = useQuery(
    ["/user/user_store", userId],
    () => getUserStore(userToken),
    {
      enabled: !!userId && !!userToken,
    }
  );

  if (isLoading) {
    return <LoadingSpinner />;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
      <div className="col-span-full space-y-3">
        <Breadcrumb
          navList={[
            {
              title: "Home",
              href: "/seller",
            },
            {
              title: "Store",
              href: "/seller/store",
            },
          ]}
        />

        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Storefront & Info
        </h1>
      </div>

      <div className="col-span-full lg:col-auto space-y-2 lg:space-y-4">
        <BaseCard className="flex gap-3">
          <div className="w-32 h-32 relative">
            <Image
              src={store.image || ""}
              alt=""
              fill
              sizes="8rem"
              loading="lazy"
              className="object-cover rounded"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{store.name}</h2>
            <span className="inline-block bg-green-100 text-green-800 font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              {store.status}
            </span>
          </div>
        </BaseCard>

        <BaseCard className="space-y-4">
          <h2 className="text-xl font-semibold">Store Address</h2>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Address
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.address}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                City
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.city}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Province
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {store.province}
              </p>
            </div>
          </div>
        </BaseCard>
      </div>

      <div className="coll-span-full lg:col-span-2">
        <BaseCard className="space-y-4">
          <h2 className="text-xl font-semibold">Banner</h2>

          {store.store_banners && store.store_banners.length > 0 ? (
            <BannerCarousel store_banners={store.store_banners} />
          ) : (
            <div>No Store Banners</div>
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
              src={banner.image || ""}
              alt=""
              fill
              sizes="50vh"
              loading="lazy"
              className="object-cover rounded"
            />
            <span className="absolute inset-0 bg-black/10" />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

const CustomRightArrow = ({ onClick, ...rest }: ArrowProps) => {
  // onMove means if dragging or swiping in progress.
  return <button onClick={() => onClick && onClick()}>{">>"}</button>;
};
