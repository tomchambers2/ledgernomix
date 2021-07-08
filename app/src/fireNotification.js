import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export const fireNotification = function (text) {
  toast(text, {
    style: { fontSize: "200%", color: "black" },
    position: "top-center",
  });
};
