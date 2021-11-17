import "../styles.css";
import { SWRConfig } from "swr";
import API from "../services/api";

const swrOptions = {
  fetcher: API.swrFetcher,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404.
    if (error.status === 404) return;
    if (error.status === 401) return;

    // Only retry up to 10 times.
    if (retryCount >= 2) return;
    // Retry after 5 seconds.
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={swrOptions}>
      <Component {...pageProps} />;
    </SWRConfig>
  );
}

export default MyApp;
