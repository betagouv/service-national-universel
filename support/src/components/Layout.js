import Head from "next/head";

import { ToastContainer } from "react-toastify";
import NavBar from "./NavBar";

const Layout = ({ title, children, className = "" }) => {
  return (
    <>
      <Head>
        <title>SNU - Admin Support - {title}</title>
      </Head>
      <NavBar />
      <div className={`relative flex-grow w-full h-full overflow-hidden transition-transform bg-coolGray-100 ${className}`}>{children}</div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop theme="colored" closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default Layout;
