import toaster from "react-hot-toast";

export const openToast = (
  type: "success" | "error" | "info" | "warning",
  message: string
) => {
  if (type === "success") {
    toaster.success(message);
  } else if (type === "error") {
    toaster.error(message);
  } else if (type === "info") {
    toaster.dismiss(message);
  } else if (type === "warning") {
    toaster.dismiss(message);
  } else {
    return;
  }
};
