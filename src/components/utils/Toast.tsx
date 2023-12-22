import toast, { Toast } from "react-hot-toast";
import { IconType } from "react-icons";
import {
  MdCheck,
  MdClose,
  MdOutlineInfo,
  MdOutlineWarning,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";
import BaseCard from "./BaseCard";

const variantIcon = {
  success: MdCheck,
  error: MdClose,
  warning: MdOutlineWarning,
  info: MdOutlineInfo,
};

const variantBgIcon = {
  success: "bg-green-600 dark:bg-green-600",
  error: "bg-red-600 dark:bg-red-600",
  warning: "bg-amber-600 dark:bg-amber-600",
  info: "bg-blue-600 dark:bg-blue-600",
};

type ToastComponentProps = {
  t: Toast;
  variant?: keyof typeof variantIcon;
  message: string;
};

export default function ToastComponent({
  t,
  variant = "info",
  message,
}: ToastComponentProps) {
  t.type;
  const Icon: IconType = variantIcon[variant];
  const iconBgClass = variantBgIcon[variant];

  const messageToDisplay =
    message.length > 30 ? message.slice(0, 40) + "..." : message;
  return (
    <BaseCard
      onClick={() => toast.dismiss(t.id)}
      className={twMerge(
        "flex items-center gap-4 py-2 px-4 shadow-lg border-gray-500 cursor-pointer"
      )}
    >
      <div
        className={twMerge(
          "h-8 w-8 rounded-full flex items-center justify-center text-gray-50",
          iconBgClass
        )}
      >
        <Icon className="text-xl" />
      </div>
      <div className="flex-grow">{messageToDisplay}</div>
    </BaseCard>
  );
}
