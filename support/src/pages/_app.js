import "../global.css";
import { SWRConfig } from "swr";
import swrConfigOptions from "../services/swrConfigOptions";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={swrConfigOptions}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
