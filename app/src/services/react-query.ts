import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.message === "AuthenticationError") {
        console.log("Unauthorized, redirecting to auth");
        window.location.href = "/auth?disconnected=1";
        return;
      }
      capture(error);
    },
  }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});
