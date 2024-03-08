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
import { useRouter } from "next/router";

const variantIcon = {
  success: MdCheck,
  error: MdClose,
  warning: MdOutlineWarning,
  info: MdOutlineInfo,
};

const variantBgIcon = {
  success: "bg-green-500/20 dark:bg-green-500/20 text-green-500",
  error: "bg-red-500/20 dark:bg-red-500/20 text-red-500",
  warning: "bg-amber-500/20 dark:bg-amber-500/20 text-amber-500",
  info: "bg-sky-500/20 dark:bg-sky-500/20 text-sky-500",
};

const variantBorderClass = {
  success: "border-green-200 dark:border-green-800",
  error: "border-red-200 dark:border-red-800",
  warning: "border-amber-200 dark:border-amber-800",
  info: "border-sky-200 dark:border-sky-800",
};

type ToastComponentProps = {
  t: Toast;
  variant?: keyof typeof variantIcon;
  message: string | { title?: string; body?: string; action_url?: string };
};

export default function ToastComponent({
  t,
  variant = "info",
  message,
}: ToastComponentProps) {
  const router = useRouter();

  const Icon: IconType = variantIcon[variant];
  const iconBgClass = variantBgIcon[variant];

  // const messageToDisplay =
  //   message.length > 30 ? message.slice(0, 40) + "..." : message;
  return (
    <BaseCard
      className={twMerge(
        "flex items-center gap-4 py-2 px-4 shadow-lg border-gray-500 border w-full max-w-sm",
        variantBorderClass[variant]
      )}
    >
      <div
        onClick={() => {
          if (!(typeof message === "string") && message.action_url) {
            router.push(message.action_url);
          }

          toast.dismiss(t.id);
        }}
        className="flex-grow flex items-start gap-6 cursor-pointer"
      >
        <div
          className={twMerge(
            "flex-shrink-0 h-10 w-10 rounded flex items-center justify-center",
            iconBgClass
          )}
        >
          <Icon className="text-2xl" />
        </div>

        {typeof message === "string" ? (
          <div className="flex-grow">
            <p className="text-base">{message}</p>
          </div>
        ) : (
          <div className="flex-grow space-y-1">
            <p className="text-base leading-none">{message.title}</p>
            <p className="text-sm leading-snug text-gray-500 dark:text-gray-400">
              {message.body}
            </p>
          </div>
        )}
      </div>

      <MdClose
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 text-2xl leading-none cursor-pointer"
      />
    </BaseCard>
  );
}
