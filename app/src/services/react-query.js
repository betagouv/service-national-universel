import { capture } from "@/sentry";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => capture(error) }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});
