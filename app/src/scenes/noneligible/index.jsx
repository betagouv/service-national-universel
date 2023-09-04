import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import DFSRLayout from "@/components/dsfr/layout/DSFRLayout";
import MobileNonEligible from "../reinscription/mobile/stepNonEligible";
import DesktopNonEligible from "../reinscription/desktop/stepNonEligible";

import useDevice from "../../hooks/useDevice";

import { YOUNG_STATUS } from "snu-lib";

const ComponentNonEligible = () => {
  const device = useDevice();
  return <DFSRLayout title="Service National Universel">{device === "desktop" ? <DesktopNonEligible /> : <MobileNonEligible />}</DFSRLayout>;
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (young?.status !== YOUNG_STATUS.NOT_ELIGIBLE) return <Redirect to={{ pathname: "/" }} />;

  return <SentryRoute path="/noneligible" component={() => <ComponentNonEligible />} />;
}
