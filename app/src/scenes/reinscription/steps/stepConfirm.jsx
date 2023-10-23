import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { Link, useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE, formatDateFR, translate, translateGrade } from "snu-lib";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";

export default function StepConfirm() {
  const [error, setError] = useState({});
  const [data] = React.useContext(ReinscriptionContext);
  const dispatch = useDispatch();

  const history = useHistory();

  const onSubmit = async () => {
    const values = {
      schooled: data.school ? "true" : "false",
      schoolName: data.school?.fullName,
      schoolType: data.school?.type,
      schoolAddress: data.school?.address || data.school?.adresse,
      schoolZip: data.school?.postCode || data.school?.postcode,
      schoolCity: data.school?.city,
      schoolDepartment: data.school?.departmentName || data.school?.department,
      schoolRegion: data.school?.region,
      schoolCountry: data.school?.country,
      schoolId: data.school?.id,
      zip: data.zip,
      cohort: data.cohort,
      grade: data.scolarity,
    };

    try {
      const { code, ok, data } = await api.put("/young/reinscription", values);
      if (!ok) {
        setError({ text: `Une erreur s'est produite : ${translate(code)}` });
      } else {
        plausibleEvent("Phase0/CTA reinscription - inscription");
        dispatch(setYoung(data));
        history.push("/inscription2023");
      }
    } catch (e) {
      capture(e);
      setError({ text: `Une erreur s'est produite : ${translate(e.code)}` });
    }
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Ces informations sont-elles correctes ?" supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}>
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="my-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#161616]">Mon éligibilité</h1>
          <Link to="./eligibilite">
            <EditPen />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">Niveau de scolarité&nbsp;:</p>
            <p className="text-right">{translateGrade(data.scolarity)}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">Date de naissance&nbsp;:</p>
            <p className="text-right">{formatDateFR(data.birthDate)}</p>
          </div>
          {data.school ? (
            <>
              {data.school?.country && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">Pays de l&apos;établissement&nbsp;:</p>
                  <p className="text-right capitalize">{data.school?.country?.toLowerCase()}</p>
                </div>
              )}
              {data.school?.city && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">Commune de l&apos;établissement&nbsp;:</p>
                  <p className="text-right">{data.school.city}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">Nom de l&apos;établissement&nbsp;:</p>
                <p className="truncate text-right">{data.school.fullName}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500">Code postal&nbsp;:</p>
              <p className="text-right">{data.zip}</p>
            </div>
          )}
        </div>

        <hr className="my-6" />

        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Mon sejour de cohésion</h1>
          <Link to="./sejour">
            <EditPen />
          </Link>
        </div>
        <div className="font-normal text-[#161616] pb-4">{COHESION_STAY_LIMIT_DATE[data?.cohort]}</div>

        <SignupButtonContainer onClickNext={() => onSubmit()} labelNext="Oui, finaliser mon inscription" disabled={Object.values(error).length} />
      </DSFRContainer>
    </>
  );
}
