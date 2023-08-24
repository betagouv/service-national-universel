import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import useDevice from "../../hooks/useDevice";

import DesktopPresentation from "./desktop/presentation";
import DesktopVerification from "./desktop/verification";
import DesktopConsentement from "./desktop/consentement";
import DesktopCniInvalide from "./desktop/cni-invalide";
import DesktopCniInvalideDone from "./desktop/cni-invalide-done";
import DesktopDone from "./desktop/done";
import DesktopTokenInvalide from "./desktop/token-invalide";
import DesktopImageRights from "./desktop/image-rights";
import DesktopImageRightsDone from "./desktop/image-rights-done";

import MobileDone from "./mobile/done";
import MobileConsentement from "./mobile/consentement";
import MobilePresentation from "./mobile/presentation";
import MobileVerification from "./mobile/verification";
import MobileCniInvalide from "./mobile/cni-invalide";
import MobileCniInvalideDone from "./mobile/cni-invalide-done";
import MobileTokenInvalide from "./mobile/token-invalide";
import MobileImageRights from "./mobile/image-rights";
import MobileImageRightsDone from "./mobile/image-rights-done";

import Header from "@/components/dsfr/layout/header";
import HeaderMenu from "@/components/dsfr/nav/Menu";
import Footer from "@/components/dsfr/layout/Footer";
import FranceConnectCallback from "./components/FranceConnectCallback";
import RepresentantsLegauxContextProvider from "../../context/RepresentantsLegauxContextProvider";

const STEPS = {
  TOKEN_INVALIDE: "TOKEN_INVALIDE",
  CNI_INVALIDE: "CNI_INVALIDE",
  CNI_INVALIDE_DONE: "CNI_INVALIDE_DONE",
  PRESENTATION: "PRESENTATION",
  VERIFICATION: "VERIFICATION",
  CONSENTEMENT: "CONSENTEMENT",
  DONE: "DONE",
  PRESENTATION_PARENT2: "PRESENTATION_PARENT2",
  VERIFICATION_PARENT2: "VERIFICATION_PARENT2",
  CONSENTEMENT_PARENT2: "CONSENTEMENT_PARENT2",
  DONE_PARENT2: "DONE_PARENT2",
  IMAGE_RIGHTS: "IMAGE_RIGHTS",
  IMAGE_RIGHTS_DONE: "IMAGE_RIGHTS_DONE",
  IMAGE_RIGHTS_PARENT2: "IMAGE_RIGHTS_PARENT2",
  IMAGE_RIGHTS_DONE_PARENT2: "IMAGE_RIGHTS_DONE_PARENT2",
};

const Step = ({ step }) => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);

  function renderStep(step) {
    if (step === STEPS.TOKEN_INVALIDE) return device === "desktop" ? <DesktopTokenInvalide step={step} /> : <MobileTokenInvalide step={step} />;
    if (step === STEPS.CNI_INVALIDE) return device === "desktop" ? <DesktopCniInvalide step={step} /> : <MobileCniInvalide step={step} />;
    if (step === STEPS.CNI_INVALIDE_DONE) return device === "desktop" ? <DesktopCniInvalideDone step={step} /> : <MobileCniInvalideDone step={step} />;

    if (step === STEPS.PRESENTATION) return device === "desktop" ? <DesktopPresentation step={step} parentId={1} /> : <MobilePresentation step={step} parentId={1} />;
    if (step === STEPS.VERIFICATION) return device === "desktop" ? <DesktopVerification step={step} parentId={1} /> : <MobileVerification step={step} parentId={1} />;
    if (step === STEPS.CONSENTEMENT) return device === "desktop" ? <DesktopConsentement step={step} parentId={1} /> : <MobileConsentement step={step} parentId={1} />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone step={step} parentId={1} /> : <MobileDone step={step} parentId={1} />;

    if (step === STEPS.PRESENTATION_PARENT2) return device === "desktop" ? <DesktopPresentation step={step} parentId={2} /> : <MobilePresentation step={step} parentId={2} />;
    if (step === STEPS.VERIFICATION_PARENT2) return device === "desktop" ? <DesktopVerification step={step} parentId={2} /> : <MobileVerification step={step} parentId={2} />;
    if (step === STEPS.CONSENTEMENT_PARENT2) return device === "desktop" ? <DesktopConsentement step={step} parentId={2} /> : <MobileConsentement step={step} parentId={2} />;
    if (step === STEPS.DONE_PARENT2) return device === "desktop" ? <DesktopDone step={step} parentId={2} /> : <MobileDone step={step} parentId={2} />;

    if (step === STEPS.IMAGE_RIGHTS) return device === "desktop" ? <DesktopImageRights step={step} parentId={1} /> : <MobileImageRights step={step} parentId={1} />;
    if (step === STEPS.IMAGE_RIGHTS_DONE) return device === "desktop" ? <DesktopImageRightsDone step={step} parentId={1} /> : <MobileImageRightsDone step={step} parentId={1} />;
    if (step === STEPS.IMAGE_RIGHTS_PARENT2) return device === "desktop" ? <DesktopImageRights step={step} parentId={2} /> : <MobileImageRights step={step} parentId={2} />;
    if (step === STEPS.IMAGE_RIGHTS_DONE_PARENT2) {
      return device === "desktop" ? <DesktopImageRightsDone step={step} parentId={2} /> : <MobileImageRightsDone step={step} parentId={2} />;
    }

    return device === "desktop" ? <DesktopPresentation step={step} /> : <MobilePresentation step={step} />;
  }

  return (
    <div className="flex h-screen flex-col justify-between bg-white md:!bg-[#f9f6f2]">
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {renderStep(step)}
      {device === "desktop" ? <Footer /> : null}
    </div>
  );
};

export default function Index() {
  return (
    <Switch>
      <SentryRoute path="/representants-legaux/token-invalide" component={() => <Step step={STEPS.TOKEN_INVALIDE} />} />
      <SentryRoute path="/representants-legaux/france-connect-callback" component={() => <FranceConnectCallback />} />

      <SentryRoute
        path={[
          "/representants-legaux/cni-invalide",
          "/representants-legaux/cni-invalide-done",
          "/representants-legaux/presentation",
          "/representants-legaux/verification",
          "/representants-legaux/consentement",
          "/representants-legaux/done",
          "/representants-legaux/droits-image",
          "/representants-legaux/droits-image-done",
        ]}
        component={() => (
          <Switch>
            <RepresentantsLegauxContextProvider parentId="1">
              <SentryRoute path="/representants-legaux/cni-invalide" component={() => <Step step={STEPS.CNI_INVALIDE} />} />
              <SentryRoute path="/representants-legaux/cni-invalide-done" component={() => <Step step={STEPS.CNI_INVALIDE_DONE} />} />
              <SentryRoute path="/representants-legaux/presentation" component={() => <Step step={STEPS.PRESENTATION} />} />
              <SentryRoute path="/representants-legaux/verification" component={() => <Step step={STEPS.VERIFICATION} />} />
              <SentryRoute path="/representants-legaux/consentement" component={() => <Step step={STEPS.CONSENTEMENT} />} />
              <SentryRoute path="/representants-legaux/done" component={() => <Step step={STEPS.DONE} />} />
              <SentryRoute path="/representants-legaux/droits-image" component={() => <Step step={STEPS.IMAGE_RIGHTS} />} />
              <SentryRoute path="/representants-legaux/droits-image-done" component={() => <Step step={STEPS.IMAGE_RIGHTS_DONE} />} />
            </RepresentantsLegauxContextProvider>
          </Switch>
        )}
      />

      <SentryRoute
        path={[
          "/representants-legaux/presentation-parent2",
          "/representants-legaux/verification-parent2",
          "/representants-legaux/consentement-parent2",
          "/representants-legaux/done-parent2",
          "/representants-legaux/droits-image2",
          "/representants-legaux/droits-image-done2",
        ]}
        component={() => (
          <Switch>
            <RepresentantsLegauxContextProvider parentId="2">
              <SentryRoute path="/representants-legaux/presentation-parent2" component={() => <Step step={STEPS.PRESENTATION_PARENT2} />} />
              <SentryRoute path="/representants-legaux/verification-parent2" component={() => <Step step={STEPS.VERIFICATION_PARENT2} />} />
              <SentryRoute path="/representants-legaux/consentement-parent2" component={() => <Step step={STEPS.CONSENTEMENT_PARENT2} />} />
              <SentryRoute path="/representants-legaux/done-parent2" component={() => <Step step={STEPS.DONE_PARENT2} />} />
              <SentryRoute path="/representants-legaux/droits-image2" component={() => <Step step={STEPS.IMAGE_RIGHTS_PARENT2} />} />
              <SentryRoute path="/representants-legaux/droits-image-done2" component={() => <Step step={STEPS.IMAGE_RIGHTS_DONE_PARENT2} />} />
            </RepresentantsLegauxContextProvider>
          </Switch>
        )}
      />
    </Switch>
  );
}
