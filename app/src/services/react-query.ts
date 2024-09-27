import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: Error) => {
      if (error.name === "AuthenticationError") {
        console.log("Unauthorized, redirecting to auth");
        window.location.href = "/auth?disconnected=1";
        return;
      }
      capture(error);
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
