import BaseCard from "@/components/utils/BaseCard";
import ToastComponent from "@/components/utils/Toast";
import toast from "react-hot-toast";

export default {
  success: (message: string) =>
    toast.custom((t) => (
      <ToastComponent t={t} message={message} variant="success" />
    )),
  error: (message: string) =>
    toast.custom((t) => (
      <ToastComponent t={t} message={message} variant="error" />
    )),
  warning: (message: string) =>
    toast.custom((t) => (
      <ToastComponent t={t} message={message} variant="warning" />
    )),
  info: (message: string) =>
    toast.custom((t) => (
      <ToastComponent t={t} message={message} variant="info" />
    )),
};
