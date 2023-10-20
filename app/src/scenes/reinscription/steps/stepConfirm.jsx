import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { Link, useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE, PHONE_ZONES, formatDateFR, translate, translateGrade } from "snu-lib";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import dayjs from "dayjs";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";
// import InfoMessage from "../components/InfoMessage";

export default function StepConfirm() {
  const [error, setError] = useState({});
  const [data, removePersistedData] = React.useContext(ReinscriptionContext);
  // const dispatch = useDispatch();

  const history = useHistory();

  useEffect(
    () =>
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      }),
    [error],
  );

  const onSubmit = async () => {
    const values = {
      // email: data.email,
      // phone: data.phone,
      // phoneZone: data.phoneZone,
      // firstName: data.firstName,
      // lastName: data.lastName,
      // frenchNationality: data.frenchNationality,
      // password: data.password,
      birthdateAt: dayjs(data.birthDate).locale("fr").format("YYYY-MM-DD"),
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
      status: data.status,
      // zip: data.zip,
      cohort: data.cohort,
      grade: data.scolarity,
    };

    if (values.schooled === "true") values.grade = data.scolarity;

    try {
      const { code, ok } = await api.post("/young/signup", values);
      if (!ok) {
        setError({ text: `Une erreur s'est produite : ${translate(code)}` });
      } else {
        plausibleEvent("Phase0/CTA reinscription - inscription");
      }
      const { user: young, token } = await api.post(`/young/signin`, { email: data.email, password: data.password });
      if (young) {
        if (token) api.setToken(token);
        await api.post(`/young/reinscription/updateYoung`, { values });
        // dispatch(setYoung(young));
        removePersistedData();
      }
      history.push("/inscription2023");
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED")
        setError({ text: "Vous avez déjà un compte sur la plateforme SNU, renseigné avec ces informations (prénom, nom et date de naissance)." });
      else {
        capture(e);
        setError({ text: `Une erreur s'est produite : ${translate(e.code)}` });
      }
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

        {/* <hr className="my-6" />
        <InfoMessage>Nous allons vous envoyer un code pour activer votre adresse e-mail.</InfoMessage> */}

        <SignupButtonContainer onClickNext={() => onSubmit()} labelNext="Oui, recevoir un code d'activation par e-mail" disabled={Object.values(error).length} />
      </DSFRContainer>
    </>
  );
}

// function SessionButton(session) {
//   return (
//     <div
//       key={session.id}
//       className="my-3 flex items-center justify-between border p-4 hover:cursor-pointer"
//       onClick={async () => {
//         const { ok, data, code } = await api.put("/young/reinscription/updateYoung", {
//           cohortChangeReason: "Réinscription à un nouveau séjour",
//           cohort: session.name,
//           originalCohort: young.cohort,
//         });
//         if (!ok) {
//           capture(code);
//           return toastr.error("Oups, une erreur est survenue", translate(code));
//         }
//         dispatch(setYoung(data));

//         plausibleEvent(session.event.replace("inscription", "reinscription"));
//         history.push("/reinscription/consentement");
//       }}>
//       <div>
//         Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
//       </div>
//       <ArrowRightBlueSquare />
//     </div>
//   );
// }
