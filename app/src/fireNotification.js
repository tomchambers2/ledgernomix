import Noty from "noty";

export const fireNotification = function (text, type) {
  new Noty({
    text,
    type: type || "info",
    timeout: 10000,
  }).show();
};
