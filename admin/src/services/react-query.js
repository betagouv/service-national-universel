import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { ERRORS } from "snu-lib";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#defining-on-demand-messages
      if (query.meta?.errorMessage) {
        toastr.error("Erreur", query.meta.errorMessage);
      }
      // Filter out 401, 404 and 403 errors
      if (error.message === ERRORS.NOT_FOUND || error.message === ERRORS.UNAUTHORIZED || error.message === ERRORS.FORBIDDEN) {
        return;
      }
      capture(error);
    },
  }),
});
