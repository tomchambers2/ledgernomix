import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export const fireNotification = function (text) {
  toast(text, {
    position: "top-center",
  });
};
