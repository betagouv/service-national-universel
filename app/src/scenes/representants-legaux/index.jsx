import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import MobileDone from "./mobile/done";
import MobileConsentement from "./mobile/consentement";
import MobilePresentation from "./mobile/presentation";
import MobileVerification from "./mobile/verification";
import MobileCniInvalide from "./mobile/cni-invalide";
import MobileCniInvalideDone from "./mobile/cni-invalide-done";
import MobileTokenInvalide from "./mobile/token-invalide";
import MobileImageRights from "./mobile/image-rights";
import MobileImageRightsDone from "./mobile/image-rights-done";
import RiConsentement from "./mobile/RiConsentement";

import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
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
  RI_CONSENTEMENT: "RI_CONSENTEMENT",
};

const Step = ({ step }) => {
  function renderStep(step) {
    if (step === STEPS.TOKEN_INVALIDE) return <MobileTokenInvalide step={step} />;
    if (step === STEPS.CNI_INVALIDE) return <MobileCniInvalide step={step} />;
    if (step === STEPS.CNI_INVALIDE_DONE) return <MobileCniInvalideDone step={step} />;

    if (step === STEPS.PRESENTATION) return <MobilePresentation step={step} parentId={1} />;
    if (step === STEPS.VERIFICATION) return <MobileVerification step={step} parentId={1} />;
    if (step === STEPS.CONSENTEMENT) return <MobileConsentement step={step} parentId={1} />;
    if (step === STEPS.RI_CONSENTEMENT) return <MobileImageRightsDone step={step} parentId={1} />;
    if (step === STEPS.DONE) return <MobileDone step={step} parentId={1} />;

    if (step === STEPS.PRESENTATION_PARENT2) return <MobilePresentation step={step} parentId={2} />;
    if (step === STEPS.VERIFICATION_PARENT2) return <MobileVerification step={step} parentId={2} />;
    if (step === STEPS.CONSENTEMENT_PARENT2) return <MobileConsentement step={step} parentId={2} />;
    if (step === STEPS.DONE_PARENT2) return <MobileDone step={step} parentId={2} />;

    if (step === STEPS.IMAGE_RIGHTS) return <MobileImageRights step={step} parentId={1} />;
    if (step === STEPS.IMAGE_RIGHTS_DONE) return <MobileImageRightsDone step={step} parentId={1} />;
    if (step === STEPS.IMAGE_RIGHTS_PARENT2) return <MobileImageRights step={step} parentId={2} />;
    if (step === STEPS.IMAGE_RIGHTS_DONE_PARENT2) return <MobileImageRightsDone step={step} parentId={2} />;

    return <MobilePresentation step={step} />;
  }

  return <DSFRLayout title="Inscription du volontaire">{renderStep(step)}</DSFRLayout>;
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
          "/representants-legaux/ri-consentement",
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
              <SentryRoute path="/representants-legaux/ri-consentement" component={() => <RiConsentement step={STEPS.RI_CONSENTEMENT} />} />
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
