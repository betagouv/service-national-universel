import Head from "next/head";
import { ToastContainer } from "react-toastify";
import Drawer from "./Drawer";

const Layout = ({ title, children, className = "" }) => {
  return (
    <>
      <Head>
        <title>SNU - Admin Support - {title}</title>
      </Head>
      <Drawer />
      <div className={`box-border flex-grow w-full h-full overflow-hidden ${className}`}>{children}</div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop theme="colored" closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default Layout;
