import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { PersistGate } from "redux-persist/integration/react";
import redux from "./redux/store";
import App from "./app";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./knowledge-base.css";
import "emoji-mart/css/emoji-mart.css";
import "react-day-picker/dist/style.css";
import "./style.css";
import { capture } from "./sentry";

const { store, persistor } = redux();
const container = document.getElementById("root");
const root = createRoot(container!);

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      capture(error);
    },
  }),
});

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
