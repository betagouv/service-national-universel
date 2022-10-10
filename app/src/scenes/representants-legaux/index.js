import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import useDevice from "../../hooks/useDevice";

import DesktopPresentation from "./desktop/presentation";
import DesktopVerification from "./desktop/verification";
import DesktopConsentement from "./desktop/consentement";
import DesktopConsentementParent2 from "./desktop/consentement-parent2";
import DesktopCniInvalide from "./desktop/cni-invalide";
import DesktopDone from "./desktop/done";
import DesktopTokenInvalide from "./desktop/token-invalide";

import MobileDone from "./mobile/done";
import MobileConsentement from "./mobile/consentement";
import MobileConsentementParent2 from "./mobile/consentement-parent2";
import MobilePresentation from "./mobile/presentation";
import MobileVerification from "./mobile/verification";
import MobileCniInvalide from "./mobile/cni-invalide";
import MobileTokenInvalide from "./mobile/token-invalide";

import Header from "./../../components/header";
import HeaderMenu from "../../components/headerMenu";
import Footer from "./../../components/footerV2";
import FranceConnectCallback from "./components/FranceConnectCallback";
import RepresentantsLegauxContextProvider from "../../context/RepresentantsLegauxContextProvider";

const STEPS = {
  CNI_INVALIDE: "CNI_INVALIDE",
  PRESENTATION: "PRESENTATION",
  VERIFICATION: "VERIFICATION",
  CONSENTEMENT: "CONSENTEMENT",
  CONSENTEMENT_PARENT2: "CONSENTEMENT_PARENT2",
  DONE: "DONE",
  TOKEN_INVALIDE: "TOKEN_INVALIDE",
};

const Step = ({ step }) => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);

  function renderStep(step) {
    if (step === STEPS.CNI_INVALIDE) return device === "desktop" ? <DesktopCniInvalide step={step} /> : <MobileCniInvalide step={step} />;
    if (step === STEPS.PRESENTATION) return device === "desktop" ? <DesktopPresentation step={step} /> : <MobilePresentation step={step} />;
    if (step === STEPS.VERIFICATION) return device === "desktop" ? <DesktopVerification step={step} /> : <MobileVerification step={step} />;
    if (step === STEPS.CONSENTEMENT) return device === "desktop" ? <DesktopConsentement step={step} /> : <MobileConsentement step={step} />;
    if (step === STEPS.CONSENTEMENT_PARENT2) return device === "desktop" ? <DesktopConsentementParent2 step={step} /> : <MobileConsentementParent2 step={step} />;
    if (step === STEPS.TOKEN_INVALIDE) return device === "desktop" ? <DesktopTokenInvalide step={step} /> : <MobileTokenInvalide step={step} />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone step={step} /> : <MobileDone step={step} />;
    return device === "desktop" ? <DesktopPresentation step={step} /> : <MobilePresentation step={step} />;
  }

  return (
    <div>
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {renderStep(step)}
      <Footer />
    </div>
  );
};

export default function Index() {
  return (
    <>
      <Switch>
        <SentryRoute path="/representants-legaux/token-invalide" component={() => <Step step={STEPS.TOKEN_INVALIDE} />} />
        <SentryRoute path="/representants-legaux/france-connect-callback" component={() => <FranceConnectCallback />} />

        <SentryRoute
          path={[
            "/representants-legaux/cni-invalide",
            "/representants-legaux/presentation",
            "/representants-legaux/verification",
            "/representants-legaux/consentement",
            "/representants-legaux/done",
          ]}
          component={() => (
            <Switch>
              <RepresentantsLegauxContextProvider parentId="1">
                <SentryRoute path="/representants-legaux/cni-invalide" component={() => <Step step={STEPS.CNI_INVALIDE} />} />
                <SentryRoute path="/representants-legaux/presentation" component={() => <Step step={STEPS.PRESENTATION} />} />
                <SentryRoute path="/representants-legaux/verification" component={() => <Step step={STEPS.VERIFICATION} />} />
                <SentryRoute path="/representants-legaux/consentement" component={() => <Step step={STEPS.CONSENTEMENT} />} />
                <SentryRoute path="/representants-legaux/done" component={() => <Step step={STEPS.DONE} />} />
              </RepresentantsLegauxContextProvider>
            </Switch>
          )}
        />

        <SentryRoute
          path="/representants-legaux/consentement-parent2"
          component={() => (
            <RepresentantsLegauxContextProvider parentId="2">
              <Step step={STEPS.CONSENTEMENT_PARENT2} />
            </RepresentantsLegauxContextProvider>
          )}
        />
      </Switch>
    </>
  );
}
