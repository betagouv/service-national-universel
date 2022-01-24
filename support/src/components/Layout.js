import Head from "next/head";

import { ToastContainer } from "react-toastify";
import NavBar from "./NavBar";
import TopBar from "./TopBar";

const Layout = ({ title, children, className = "" }) => {
  return (
    <>
      <Head>
        <title>SNU - Admin Support - {title}</title>
      </Head>
      <div className="flex overflow-hidden w-full h-full max-w-full">
        <NavBar />
        <div className="flex flex-col h-full flex-shrink flex-grow">
          <TopBar />
          <div className={`relative flex-grow flex-shrink  w-full h-full overflow-hidden transition-transform bg-coolGray-100 ${className}`}>{children}</div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop theme="colored" closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default Layout;
