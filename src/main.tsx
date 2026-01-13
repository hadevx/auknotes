import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import ToastWrapper from "./ToastWrapper.js";
import "react-quill-new/dist/quill.snow.css"; // styles
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import MaintenanceWrapper from "./MaintenanceWrapper.js";

if (import.meta.env.VITE_ENVIRONMENT === "production") {
  console.log = () => {};
}

const clientId = "AaG8SvBkw84gADg9acITGalTeUzpYR6RXReOjhiLZM1wYJlEOlPgXfxJc7gl83EIazdHz9bhxTKg0PcH";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastWrapper>
        <BrowserRouter>
          <PayPalScriptProvider options={{ clientId: clientId }}>
            <MaintenanceWrapper>
              <App />
            </MaintenanceWrapper>
          </PayPalScriptProvider>
        </BrowserRouter>
      </ToastWrapper>
    </Provider>
  </StrictMode>
);
