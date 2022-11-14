import "react-toastify/dist/ReactToastify.min.css";
import "../global.css";
import "../components/BreadCrumb/styles.css";

import { SWRConfig } from "swr";

import swrConfigOptions from "../services/swrConfigOptions";
import { SeeAsProvider } from "../contexts/seeAs";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={swrConfigOptions}>
      <SeeAsProvider>
        <Component {...pageProps} />
      </SeeAsProvider>
    </SWRConfig>
  );
}

export default MyApp;
