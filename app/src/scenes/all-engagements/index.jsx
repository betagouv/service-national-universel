import React from "react";
import useDevice from "../../hooks/useDevice";

import Footer from "@/components/dsfr/components/Footer";
import Header from "@/components/dsfr/components/Header";
import DesktopView from "./desktop/EngagementsProgramDesktop";
import MobileView from "./mobile/EngagementsProgramMobile";

const Index = () => {
  const device = useDevice();
  const mobile = device === "mobile";
  return (
    <>
      <Header />
      <div>{mobile ? <MobileView /> : <DesktopView />} </div>
      {!mobile ? <Footer /> : null}
    </>
  );
};

export default Index;
