import "react-toastify/dist/ReactToastify.min.css";
import "emoji-mart/css/emoji-mart.css";
import "../global.css";
import "../components/BreadCrumb/styles.css";

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
