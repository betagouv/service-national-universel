import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.message === "AuthenticationError") {
        console.log("Unauthorized, reloading app");
        window.location.reload(true);
        return;
      }
      capture(error);
    },
  }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});
