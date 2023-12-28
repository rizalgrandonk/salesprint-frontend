import BaseCard from "@/components/utils/BaseCard";
import ToastComponent from "@/components/utils/Toast";
import HotToast from "react-hot-toast";

const toast = {
  success: (message: string) =>
    HotToast.custom((t) => (
      <ToastComponent t={t} message={message} variant="success" />
    )),
  error: (message: string) =>
    HotToast.custom((t) => (
      <ToastComponent t={t} message={message} variant="error" />
    )),
  warning: (message: string) =>
    HotToast.custom((t) => (
      <ToastComponent t={t} message={message} variant="warning" />
    )),
  info: (message: string) =>
    HotToast.custom((t) => (
      <ToastComponent t={t} message={message} variant="info" />
    )),
};

export default toast;
