import Alerts from "@/components/utils/Alerts";
import Breadcrumb from "@/components/utils/Breadcrumb";
import LoadingSpinner from "@/components/utils/LoadingSpinner";
import { getUserStore } from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { RiInformationLine } from "react-icons/ri";

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

  if (isLoading || !store) {
    return <LoadingSpinner />;
  }
  if (!isLoading && !store) {
    <Alerts variant="danger">
      <RiInformationLine className="text-lg" />
      Store data not found
    </Alerts>;
  }

  return (
    <div>
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
      {store.name}
    </div>
  );
}
