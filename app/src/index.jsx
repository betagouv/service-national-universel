import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";
import { CookiesProvider } from "react-cookie";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import store from "./redux/store";
import App from "./app";

window.addEventListener("vite:preloadError", (event) => {
  console.log("An error occured while preloading a page, reloading the page to prevent future errors.");
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <CookiesProvider>
        <App />
      </CookiesProvider>
      <ReduxToastr timeOut={1500} transitionIn="fadeIn" transitionOut="fadeOut" />
    </Provider>
  </React.StrictMode>,
);
