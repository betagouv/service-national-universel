import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import MobileNonEligible from "../reinscription/mobile/stepNonEligible";
import DesktopNonEligible from "../reinscription/desktop/stepNonEligible";

import useDevice from "../../hooks/useDevice";

import HeaderMenu from "../../components/headerMenu";
import Footer from "./../../components/footerV2";
import Header from "./../../components/header";

const ComponentNonEligible = () => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-screen justify-between md:!bg-[#f9f6f2] bg-white">
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {device === "desktop" ? <DesktopNonEligible /> : <MobileNonEligible />}
      {device === "desktop" && <Footer />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (!young) return <Redirect to={{ pathname: "/" }} />;

  return <SentryRoute path="/noneligible" component={() => <ComponentNonEligible />} />;
}
