import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#defining-on-demand-messages
      if (query.meta?.errorMessage) {
        toastr.error("Erreur", query.meta.errorMessage);
      }
      capture(error);
    },
  }),
});
