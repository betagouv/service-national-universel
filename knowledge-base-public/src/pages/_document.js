import Document, { Html, Head, Main, NextScript } from "next/document";
import { ToastContainer } from "react-toastify";
import PlausibleProvider from "next-plausible";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <script defer data-domain="support.snu.gouv.fr" src="https://plausible.io/js/plausible.js"></script>
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
