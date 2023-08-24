import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { formatDateFR, translate, translateGrade } from "snu-lib";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";
import dayjs from "dayjs";
import DSFRContainer from "../../../components/inscription/DSFRContainer";
import SignupButtonContainer from "../../../components/inscription/SignupButtonContainer";

export default function StepConfirm() {
  const [error, setError] = useState({});
  const [data, setData, removePersistedData] = React.useContext(PreInscriptionContext);

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
      email: data.email,
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

    if (values.schooled === "true") values.grade = data.scolarity;

    try {
      // eslint-disable-next-line no-unused-vars
      const { user, code, ok } = await api.post("/young/signup", values);
      if (!ok) setError({ text: `Une erreur s'est produite : ${translate(code)}` });
      plausibleEvent("Phase0/CTA preinscription - inscription");
      setData({ ...data, step: PREINSCRIPTION_STEPS.DONE });
      // removePersistedData();
      history.push("/preinscription/done");
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
    <DSFRContainer title="Ces informations sont-elles correctes ?">
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}

      <div className="space-y-4">
        <div className="my-2 flex flex-row items-center justify-between">
          <p className="text-lg font-semibold text-[#161616]">Mon éligibilité</p>
          <Link to="./eligibilite">
            <EditPen />
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666]">Niveau de scolarité&nbsp;:</p>
          <p className="text-right text-[#161616]">{translateGrade(data.scolarity)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666]">Date de naissance&nbsp;:</p>
          <p className="text-right text-[#161616]">{formatDateFR(data.birthDate)}</p>
        </div>
        {data.school ? (
          <>
            {data.school?.country && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#666666]">Pays de l&apos;établissement&nbsp;:</p>
                <p className="text-right capitalize text-[#161616]">{data.school?.country?.toLowerCase()}</p>
              </div>
            )}
            {data.school?.city && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#666666]">Commune de l&apos;établissement&nbsp;:</p>
                <p className="text-right text-[#161616]">{data.school.city}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#666666]">Nom de l&apos;établissement&nbsp;:</p>
              <p className="truncate text-right text-[#161616]">{data.school.fullName}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#666666]">Code postal&nbsp;:</p>
            <p className="text-base text-[#161616]">{data.zip}</p>
          </div>
        )}

        <div className="my-16 flex items-center justify-between pt-8">
          <p className="text-lg font-semibold text-[#161616]">Mes informations personnelles</p>
          <Link to="profil">
            <EditPen />
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666]">Prénom&nbsp;:</p>
          <p className="text-right text-[#161616]">{data.firstName}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666]">Nom&nbsp;:</p>
          <p className="text-right text-[#161616]">{data.lastName}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666]">Email&nbsp;:</p>
          <p className="text-right text-[#161616]">{data.email}</p>
        </div>
      </div>

      <SignupButtonContainer
        onClickNext={() => onSubmit()}
        labelNext="M'inscrire au SNU"
        onClickPrevious={() => history.push("/preinscription/profil")}
        disabled={Object.values(error).length}
        collapsePrevious={true}
      />
    </DSFRContainer>
  );
}
