import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import ToastWrapper from "./ToastWrapper.js";
import "react-quill-new/dist/quill.snow.css"; // styles

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastWrapper>
    </Provider>
  </StrictMode>
);
