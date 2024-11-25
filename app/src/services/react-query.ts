import { capture } from "@/sentry";
import { Query, QueryCache, QueryClient } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error, query: Query) => {
      if (error.name === "AuthenticationError") {
        console.log("Unauthorized, redirecting to auth");
        window.location.href = "/auth?disconnected=1";
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
      retry(failureCount, error) {
        if (error.name === "AuthenticationError") {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
