import React, { useContext, useState, useEffect } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import api from "@/services/api";
import ReinscriptionContextProvider, { ReinscriptionContext } from "../../context/ReinscriptionContextProvider";
import { SentryRoute, capture } from "../../sentry";

import { useSelector } from "react-redux";
import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepConfirm from "./steps/stepConfirm";

import { getStepFromUrlParam, REINSCRIPTION_STEPS as STEPS, REINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import Loader from "@/components/Loader";
import { toastr } from "react-redux-toastr";

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
      frenchNationality: young.frenchNationality,
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
    });
  }, [young]);

  const { step } = useParams();
  // console.log(data, step);
  const [isReinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [isReinscriptionOpenLoading, setReinscriptionOpenLoading] = useState(true);
  const fetchReinscriptionOpen = async () => {
    try {
      const { ok, data, code } = await api.get(`/cohort-session/isInscriptionOpen`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setReinscriptionOpen(data);
      setReinscriptionOpenLoading(false);
    } catch (e) {
      setReinscriptionOpenLoading(false);
    }
  };

  useEffect(() => {
    fetchReinscriptionOpen();
    // console.log(fetchReinscriptionOpen());
  }, []);

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);
  // console.log(currentStep);
  if (!currentStep) return <Redirect to="/reinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);
  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/reinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  if (isReinscriptionOpenLoading) return <Loader />;

  if (!isReinscriptionOpen) return <Redirect to="/" />;

  return renderStepResponsive(currentStep);
};

export default function ReInscription() {
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
