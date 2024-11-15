import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import store from "./redux/store";
import App from "./app";

import { captureMessage } from "./sentry";

window.addEventListener("vite:preloadError", (event) => {
  captureMessage("Preloading Error", event);
  window.location.reload(true);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ReduxToastr timeOut={5000} transitionIn="fadeIn" transitionOut="fadeOut" />
    </Provider>
  </React.StrictMode>,
);
