import { capture } from "@/sentry";
import { Query, QueryCache, QueryClient } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { ERROR_FILTER } from "snu-lib";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error, query: Query) => {
      if (error.name === "AuthenticationError") {
        console.log("Unauthorized, redirecting to auth");
        window.location.href = "/auth?disconnected=1";
        return;
      }
      if (ERROR_FILTER.includes(error.message as (typeof ERROR_FILTER)[number])) {
        return;
      }
      capture(error);
      if (query.meta?.errorMessage) {
        toastr.error("Erreur", query.meta.errorMessage as string);
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry(failureCount, error) {
        // On ne réessaie pas en cas d'erreur 401, 403 ou 404
        if (error.name === "AuthenticationError" || ERROR_FILTER.includes(error.message as (typeof ERROR_FILTER)[number])) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
