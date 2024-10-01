import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { ToastContainer } from "react-toastify";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <Script defer data-domain="support.snu.gouv.fr" src="https://plausible.io/js/script.manual.outbound-links.js"></Script>
          <Script id="plausible-setup" strategy="afterInteractive">
            {`
              window.plausible = window.plausible || function () {
                (window.plausible.q = window.plausible.q || []).push(arguments);
              };
            `}
          </Script>
          <Script id="redact-url" strategy="afterInteractive">
            {`
              var url = window.location.href;
              var redactedUrl = url.replace(/[0-9a-fA-F]{24}/g, ":id");
              plausible("pageview", { u: redactedUrl });
            `}
          </Script>
        </Head>
        <body>
          <Main />
          <NextScript />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            theme="colored"
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
