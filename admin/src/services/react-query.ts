import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { ERRORS } from "snu-lib";

const FILTERED_ERRORS = [ERRORS.NOT_FOUND, ERRORS.OPERATION_UNAUTHORIZED, ERRORS.OPERATION_NOT_ALLOWED];

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#defining-on-demand-messages
      if (query.meta?.errorMessage) {
        toastr.error("Erreur", query.meta.errorMessage as string);
      }
      if (!FILTERED_ERRORS.includes(error.message as (typeof FILTERED_ERRORS)[number])) {
        capture(error);
      }
    },
  }),
});
