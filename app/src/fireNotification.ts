import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export const fireNotification = function (text: string, type?: "error" | "warning" | "success") {
  toast(text, {
    position: "top-center",
    type: type || "default",
  });
};
