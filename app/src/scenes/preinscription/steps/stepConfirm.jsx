import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { Link, useHistory } from "react-router-dom";
import { PHONE_ZONES, formatDateFR, translate, translateGrade, isFeatureEnabled, FEATURES_NAME, getCohortPeriod } from "snu-lib";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
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
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [context, bdcURI] = isLoggedIn
    ? [ReinscriptionContext, "jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"]
    : [PreInscriptionContext, "je-me-preinscris-et-cree-mon-compte-volontaire"];
  const [error, setError] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [data, removePersistedData] = React.useContext(context);
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

  const isEmailValidationEnabled = !isLoggedIn && isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);

  const adjustSignup = async () => {
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
      setLoading(true);
      const { code, ok, data } = await api.put(`/young/reinscription?timeZoneOffset=${new Date().getTimezoneOffset()}`, values);
      if (!ok) {
        setError({ text: `Une erreur s'est produite : ${translate(code)}` });
        setLoading(false);
      } else {
        plausibleEvent("Phase0/CTA reinscription - inscription");
        dispatch(setYoung(data));
        history.push("/inscription2023");
      }
    } catch (e) {
      setLoading(false);
      capture(e);
      setError({ text: `Une erreur s'est produite : ${translate(e.code)}` });
    }
  };

  const signUp = async () => {
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
      else if (e.code === "USER_ALREADY_REGISTERED_CLE") {
        history.push(`/je-suis-deja-inscrit`);
      } else {
        capture(e);
        setError({ text: `Une erreur s'est produite : ${translate(e.code)}` });
      }
    }
  };

  const onSubmit = async () => (isLoggedIn ? await adjustSignup() : await signUp());

  return (
    <>
      <ProgressBar isReinscription={isLoggedIn} />
      <DSFRContainer title="Ces informations sont-elles correctes ?" supportEvent="Phase0/aide preinscription - recap" supportLink={`${supportURL}/base-de-connaissance/${bdcURI}`}>
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="my-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#161616]">Mon éligibilité</h1>
          <Link to="./eligibilite">
            <EditPen />
          </Link>
        </div>

        <div className="space-y-2 text-base">
          <div className="flex items-center justify-between ">
            <p className="text-gray-500">Niveau de scolarité&nbsp;:</p>
            <p className="text-right">{translateGrade(data.scolarity)}</p>
          </div>
          <div className="flex items-center justify-between ">
            <p className="text-gray-500">Date de naissance&nbsp;:</p>
            <p className="text-right">{formatDateFR(data.birthDate)}</p>
          </div>
          {data.school ? (
            <>
              {data.school?.country && (
                <div className="flex items-center justify-between ">
                  <p className="text-gray-500">Pays de l&apos;établissement&nbsp;:</p>
                  <p className="text-right capitalize">{data.school?.country?.toLowerCase()}</p>
                </div>
              )}
              {data.school?.city && (
                <div className="flex items-center justify-between ">
                  <p className="text-gray-500">Commune de l&apos;établissement&nbsp;:</p>
                  <p className="text-right">{data.school.city}</p>
                </div>
              )}
              <div className="flex items-center justify-between ">
                <p className="text-gray-500">Nom de l&apos;établissement&nbsp;:</p>
                <p className="truncate text-right">{data.school.fullName}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between ">
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
        <div className="font-normal text-[#161616] pb-4">{getCohortPeriod(selectedCohort)}</div>

        {!isLoggedIn && (
          <>
            <hr />
            <div className="flex items-center justify-between my-6">
              <h1 className="text-lg font-semibold text-[#161616]">Mes informations personnelles</h1>
              <Link to="profil">
                <EditPen />
              </Link>
            </div>

            <div className="space-y-2 mb-6 text-base">
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
          </>
        )}

        {isEmailValidationEnabled && <InfoMessage>Nous allons vous envoyer un code pour activer votre adresse e-mail.</InfoMessage>}

        <SignupButtonContainer
          onClickNext={() => onSubmit()}
          labelNext={isEmailValidationEnabled ? "Oui, recevoir un code d'activation par e-mail" : "Finaliser mon inscription"}
          disabled={isLoading}
        />
      </DSFRContainer>
    </>
  );
}
