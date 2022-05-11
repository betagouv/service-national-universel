import "react-toastify/dist/ReactToastify.min.css";
import "emoji-mart/css/emoji-mart.css";
import "../global.css";
import "../components/BreadCrumb/styles.css";

import { SWRConfig } from "swr";

import swrConfigOptions from "../services/swrConfigOptions";
import { SeeAsProvider } from "../contexts/seeAs";
import PlausibleProvider from "next-plausible";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={swrConfigOptions}>
      <PlausibleProvider domain="support.snu.gouv.fr">
        <SeeAsProvider>
          <Component {...pageProps} />
        </SeeAsProvider>
      </PlausibleProvider>
    </SWRConfig>
  );
}

export default MyApp;
