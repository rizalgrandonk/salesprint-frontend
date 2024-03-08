import BaseCard from "@/components/utils/BaseCard";
import ToastComponent from "@/components/utils/Toast";
import HotToast from "react-hot-toast";

const toast = {
  success: (
    message: string | { title?: string; body?: string; action_url?: string },
    option?: { id?: string }
  ) =>
    HotToast.custom(
      (t) => <ToastComponent t={t} message={message} variant="success" />,
      option
    ),
  error: (
    message: string | { title?: string; body?: string; action_url?: string },
    option?: { id?: string }
  ) =>
    HotToast.custom(
      (t) => <ToastComponent t={t} message={message} variant="error" />,
      option
    ),
  warning: (
    message: string | { title?: string; body?: string; action_url?: string },
    option?: { id?: string }
  ) =>
    HotToast.custom(
      (t) => <ToastComponent t={t} message={message} variant="warning" />,
      option
    ),
  info: (
    message: string | { title?: string; body?: string; action_url?: string },
    option?: { id?: string }
  ) =>
    HotToast.custom(
      (t) => <ToastComponent t={t} message={message} variant="info" />,
      option
    ),
};

export default toast;
