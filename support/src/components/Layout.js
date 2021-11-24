import Head from "next/head";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Drawer from "./Drawer";

const Layout = ({ title, children, className = "" }) => {
  const [drawerVisible, setDrawerVisible] = useState(true);
  return (
    <>
      <Head>
        <title>SNU - Admin Support - {title}</title>
      </Head>
      <Drawer visible={drawerVisible} setVisible={setDrawerVisible} />
      <div className={`relative flex-grow w-full h-full overflow-hidden transition-transform ${!drawerVisible && ""} ${className}`}>
        {children}
        {!drawerVisible && (
          <svg
            onClick={() => setDrawerVisible(true)}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-3.5 left-3 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop theme="colored" closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default Layout;
