import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import MobileNonEligible from "../reinscription/mobile/stepNonEligible";
import DesktopNonEligible from "../reinscription/desktop/stepNonEligible";

import useDevice from "../../hooks/useDevice";

import HeaderMenu from "../../components/headerMenu";
import Footer from "@/components/dsfr/components/Footer";
import Header from "./../../components/header";
import { YOUNG_STATUS } from "snu-lib";

const ComponentNonEligible = () => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex h-screen flex-col justify-between bg-white md:!bg-[#f9f6f2]">
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {device === "desktop" ? <DesktopNonEligible /> : <MobileNonEligible />}
      {device === "desktop" && <Footer />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (young?.status !== YOUNG_STATUS.NOT_ELIGIBLE) return <Redirect to={{ pathname: "/" }} />;

  return <SentryRoute path="/noneligible" component={() => <ComponentNonEligible />} />;
}
