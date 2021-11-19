import Head from "next/head";
import Drawer from "./Drawer";

const Layout = ({ title, children, className = "" }) => {
  return (
    <>
      <Head>
        <title>SNU - Admin Support - {title}</title>
      </Head>
      <Drawer />
      <div className={`box-border flex-grow w-full h-full overflow-hidden ${className}`}>{children}</div>
    </>
  );
};

export default Layout;
