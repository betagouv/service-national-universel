import Document, { Html, Head, Main, NextScript } from "next/document";
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
          <script defer data-domain="support.snu.gouv.fr" src="https://plausible.io/js/script.manual.outbound-links.js"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.plausible = window.plausible || function () {
                  (window.plausible.q = window.plausible.q || []).push(arguments);
                };
              `,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                var url = window.location.href;
                var redactedUrl = url.replace(/[0-9a-fA-F]{24}/g, ":id");
                plausible("pageview", { u: redactedUrl });
              `,
            }}
          />
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
