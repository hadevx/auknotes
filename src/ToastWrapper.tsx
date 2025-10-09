import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ToastWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastContainer autoClose={2000} theme="colored" />
      {children}
    </>
  );
}

export default ToastWrapper;
