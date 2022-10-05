import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import { YOUNG_STATUS } from "../../utils";
import { SentryRoute } from "../../sentry";

import DesktopCoordonnees from "./desktop/stepCoordonnees";
import DesktopRepresentants from "./desktop/stepRepresentants";
import DesktopConsentements from "./desktop/stepConsentements";
import DesktopDocuments from "./desktop/stepDocuments";
import DesktopDone from "./desktop/stepDone";

import MobileCoordonnees from "./mobile/stepCoordonnees";
import MobileRepresentants from "./mobile/stepRepresentants";
import MobileConsentements from "./mobile/stepConsentements";
import MobileDocuments from "./mobile/stepDocuments";
import MobileDone from "./mobile/stepDone";

import useDevice from "../../hooks/useDevice";

const STEPS = {
  COORDONNEES: "COORDONNEES",
  CONSENTEMENTS: "CONSENTEMENTS",
  REPRESENTANTS: "REPRESENTANTS",
  DOCUMENTS: "DOCUMENTS",
  DONE: "DONE",
};

const Step = ({ step }) => {
  const device = "mobile"; // useDevice();

  function renderStep(step) {
    if (step === STEPS.COORDONNEES) return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
    if (step === STEPS.REPRESENTANTS) return device === "desktop" ? <DesktopRepresentants /> : <MobileRepresentants />;
    if (step === STEPS.CONSENTEMENTS) return device === "desktop" ? <DesktopConsentements /> : <MobileConsentements />;
    if (step === STEPS.DOCUMENTS) return device === "desktop" ? <DesktopDocuments /> : <MobileDocuments />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
    return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
  }

  return (
    <div>
      {/* header */}
      {renderStep(step)}
      {/* footer */}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  //if (!young) return <Redirect to="/preinscription" />;

  // if it is a young in a status that is not eligible, they cant access to the inscription
  if (young?.status && ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_ELIGIBLE].includes(young?.status)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return (
    <Switch>
      <SentryRoute path="/inscription2023/coordonnee" component={() => <Step step={STEPS.COORDONNEES} />} />
      <SentryRoute path="/inscription2023/representant" component={() => <Step step={STEPS.REPRESENTANTS} />} />
      <SentryRoute path="/inscription2023/consentement" component={() => <Step step={STEPS.CONSENTEMENTS} />} />
      <SentryRoute path="/inscription2023/document" component={() => <Step step={STEPS.DOCUMENTS} />} />
      <SentryRoute path="/inscription2023/done" component={() => <Step step={STEPS.DONE} />} />
      {/* Redirect vers home */}
      <SentryRoute path="/inscription2023" component={() => <Step step={STEPS.COORDONNEES} />} />
    </Switch>
  );
}
