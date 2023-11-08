import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { Link, useHistory } from "react-router-dom";
import { PHONE_ZONES, formatDateFR, translate, translateGrade, isFeatureEnabled, FEATURES_NAME, getCohortPeriod } from "snu-lib";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import dayjs from "dayjs";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { environment, supportURL } from "@/config";
import InfoMessage from "../components/InfoMessage";

export default function StepConfirm() {
  const [error, setError] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [data, removePersistedData] = React.useContext(PreInscriptionContext);
  const selectedCohort = data?.sessions.find((s) => s?.name === data?.cohort);
  const dispatch = useDispatch();

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

  const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);

  const onSubmit = async () => {
    const values = {
      email: data.email,
      phone: data.phone,
      phoneZone: data.phoneZone,
      firstName: data.firstName,
      lastName: data.lastName,
      frenchNationality: data.frenchNationality,
      password: data.password,
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
      zip: data.zip,
      cohort: data.cohort,
      grade: data.scolarity,
    };

    try {
      setLoading(true);
      const { code, ok, token, user } = await api.post(`/young/signup`, values);
      if (!ok) {
        setError({ text: `Une erreur s'est produite : ${translate(code)}` });
        setLoading(false);
      } else {
        if (user) {
          plausibleEvent("Phase0/CTA preinscription - inscription");
          if (token) api.setToken(token);
          dispatch(setYoung(user));
          removePersistedData();
          history.push(isEmailValidationEnabled ? "/preinscription/email-validation" : "/preinscription/done");
        }
      }
    } catch (e) {
      setLoading(false);
      if (e.code === "USER_ALREADY_REGISTERED")
        setError({ text: "Vous avez déjà un compte sur la plateforme SNU, renseigné avec ces informations (identifiant, prénom, nom et date de naissance)." });
      else {
        capture(e);
        setError({ text: `Une erreur s'est produite : ${translate(e.code)}` });
      }
    }
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer
        title="Ces informations sont-elles correctes ?"
        supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}
        supportEvent="Phase0/aide preinscription - recap">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="my-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#161616]">Mon éligibilité</h1>
          <Link to="./eligibilite">
            <EditPen />
          </Link>
        </div>

        <div className="space-y-2 text-base">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Niveau de scolarité&nbsp;:</p>
            <p className="text-right">{translateGrade(data.scolarity)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Date de naissance&nbsp;:</p>
            <p className="text-right">{formatDateFR(data.birthDate)}</p>
          </div>
          {data.school ? (
            <>
              {data.school?.country && (
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">Pays de l&apos;établissement&nbsp;:</p>
                  <p className="text-right capitalize">{data.school?.country?.toLowerCase()}</p>
                </div>
              )}
              {data.school?.city && (
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">Commune de l&apos;établissement&nbsp;:</p>
                  <p className="text-right">{data.school.city}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-gray-500">Nom de l&apos;établissement&nbsp;:</p>
                <p className="truncate text-right">{data.school.fullName}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
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
        <div className="font-normal text-[16px] text-[#161616] pb-4">{getCohortPeriod(selectedCohort)}</div>

        <hr />

        <div className="flex items-center justify-between my-6">
          <h1 className="text-lg font-semibold text-[#161616]">Mes informations personnelles</h1>
          <Link to="profil">
            <EditPen />
          </Link>
        </div>

        <div className="space-y-2 mb-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Prénom du volontaire&nbsp;:</p>
            <p className="text-right">{data.firstName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Nom du volontaire&nbsp;:</p>
            <p className="text-right">{data.lastName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Téléphone&nbsp;:</p>
            <p className="text-right">
              {PHONE_ZONES[data.phoneZone].code} {data.phone}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-500">Email&nbsp;:</p>
            <p className="text-right">{data.email}</p>
          </div>
        </div>

        {isEmailValidationEnabled && <InfoMessage>Nous allons vous envoyer un code pour activer votre adresse e-mail.</InfoMessage>}

        <SignupButtonContainer
          onClickNext={() => onSubmit()}
          labelNext={isEmailValidationEnabled ? "Oui, recevoir un code d'activation par e-mail" : "M'inscrire au SNU"}
          disabled={isLoading}
        />
      </DSFRContainer>
    </>
  );
}
