import React, { useContext, useEffect } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import ReinscriptionContextProvider, { ReinscriptionContext } from "../../context/ReinscriptionContextProvider";
import { SentryRoute } from "../../sentry";

import { useSelector } from "react-redux";
import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepConfirm from "./steps/stepConfirm";

import { getStepFromUrlParam, REINSCRIPTION_STEPS as STEPS, REINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { hasAccessToReinscription, reInscriptionOpenForYoungs } from "snu-lib";
import FutureCohort from "../inscription2023/FutureCohort";
import { environment } from "@/config";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.INELIGIBLE) return <StepNonEligible />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
}

const Step = () => {
  const [data, updateValue] = useContext(ReinscriptionContext);
  const young = useSelector((state) => state.Auth.young);
  useEffect(() => {
    updateValue({
      ...data,
      birthDate: young.birthdateAt,
      scolarity: young.grade,
      school: {
        fullName: young.schoolName,
        type: young.schoolType,
        adresse: young.schoolAddress,
        codeCity: young.schoolZip,
        city: young.schoolCity,
        departmentName: young.schoolDepartment,
        region: young.schoolRegion,
        country: young.schoolCountry,
        id: young.schoolId,
        postCode: young.schoolZip,
      },
      zip: young.zip,
    });
  }, []);

  const { step } = useParams();

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);
  if (!currentStep) return <Redirect to="/reinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);
  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/reinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return renderStepResponsive(currentStep);
};

export default function ReInscription() {
  const young = useSelector((state) => state.Auth.young);

  if (!hasAccessToReinscription(young)) return <Redirect to="/" />;

  if (!reInscriptionOpenForYoungs(environment)) return <FutureCohort />;

  return (
    <ReinscriptionContextProvider>
      <DSFRLayout title="Reinscription du volontaire">
        <Switch>
          <SentryRoute path="/reinscription/:step" component={Step} />;
          <SentryRoute path="/reinscription" component={Step} />;
        </Switch>
      </DSFRLayout>
    </ReinscriptionContextProvider>
  );
}
