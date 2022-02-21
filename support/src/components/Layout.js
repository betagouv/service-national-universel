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
      <div className="flex h-full w-full max-w-full overflow-hidden">
        <NavBar />
        <div className="flex h-full flex-shrink flex-grow flex-col">
          <TopBar />
          <div className={`content relative h-full w-full  flex-shrink flex-grow overflow-hidden bg-coolGray-100 transition-transform ${className}`}>{children}</div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop theme="colored" closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default Layout;
