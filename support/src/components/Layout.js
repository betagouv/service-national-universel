import Head from "next/head";
import Drawer from "./Drawer";

const Layout = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>SNU - Admin Support - {title}</title>
      </Head>
      <Drawer />
      <div className="flex-grow w-full h-full">{children}</div>
    </>
  );
};

export default Layout;
