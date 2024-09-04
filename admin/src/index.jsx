import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import "react-day-picker/dist/style.css";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, LinearScale } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, LinearScale);

import store from "./redux/store";
import App from "./app.jsx";

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  console.log("An error occured while preloading a page, reloading the page to prevent future errors.");
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ReduxToastr timeOut={1500} transitionIn="fadeIn" transitionOut="fadeOut" />
    </Provider>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
