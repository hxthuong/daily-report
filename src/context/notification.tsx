import { AlertTriangle, InfoIcon } from "lucide-react";
import { createContext, useContext } from "react";
import toast, { Toaster, ToastOptions } from "react-hot-toast";

export const notify = {
  success: (msg: string, options?: ToastOptions) => toast.success(msg, options),
  error: (msg: string, options?: ToastOptions) => toast.error(msg, options),
  warning: (msg: string, options?: ToastOptions) =>
    toast(msg, {
      ...options,
      icon: <AlertTriangle className="w-5 h-5 animate-ping" />,
      style: { background: "white", color: "var(--color-yellow-500)" },
    }),
  info: (msg: string, options?: ToastOptions) =>
    toast(msg, {
      ...options,
      icon: <InfoIcon className="w-5 h-5 animate-bounce" />,
      style: { background: "white", color: "var(--color-blue-700)" },
    }),
};

// tạo context với default value
export const NotificationContext = createContext<typeof notify>(notify);

// hook
export const useNotification = () => useContext(NotificationContext);

export const Notification = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
      }}
    />
  );
};
