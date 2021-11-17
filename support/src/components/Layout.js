import Drawer from "./Drawer";

const Layout = ({ children }) => {
  return (
    <>
      <Drawer />
      <div>{children}</div>
    </>
  );
};

export default Layout;
