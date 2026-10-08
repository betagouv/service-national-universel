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
import { reloadAfterPreloadError } from "./utils/preloadErrorReload";

// Import dynamique en échec (build remplacé, bascule d'instances) : la page est rechargée (garde-fou dans le module).
// reload(true) : rechargement sans cache sous Firefox, paramètre ignoré par les autres navigateurs.
window.addEventListener("vite:preloadError", (event) => {
  // Contexte Sentry en objet simple : passé tel quel, l'Event était ignoré et le module en échec perdu
  captureMessage("Preloading Error", { extra: { error: String(event.payload) } });
  reloadAfterPreloadError({ reload: () => window.location.reload(true) });
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ReduxToastr timeOut={5000} transitionIn="fadeIn" transitionOut="fadeOut" />
    </Provider>
  </React.StrictMode>,
);
