import React from "react";
import useDevice from "../../hooks/useDevice";

import Footer from "../../components/footerV2";
import Header from "../../components/header";
import DesktopView from "./desktop/EngagementsProgramDesktop.js";
import MobileView from "./mobile/EngagementsProgramMobile.js";

const Index = () => {
  const device = useDevice();
  const mobile = device === "mobile";
  return (
    <>
      <Header />
      <div>{mobile ? <MobileView /> : <DesktopView />} </div>
      <Footer marginBottom={"12vh"} />
    </>
  );
};

export default Index;
