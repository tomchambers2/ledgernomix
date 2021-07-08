import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export const fireNotification = function (text, type) {
  toast(text, {
    style: { fontSize: "200%", color: "white", backgroundColor: "red" },
    position: "top-center",
  });
};
