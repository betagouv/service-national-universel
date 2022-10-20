import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import api from "../../../services/api";
import { translate, translateGrade, formatDateFR } from "snu-lib";
import plausibleEvent from "../../../services/plausible";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import { capture } from "../../../sentry";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";

export default function StepDone() {
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
      birthdateAt: data.birthDate,
      schooled: data.school ? "true" : "false",
      schoolName: data.school?.fullName,
      schoolType: data.school?.type,
      schoolAddress: data.school?.address || data.school?.adresse,
      schoolZip: data.school?.postCode || data.school?.postcode,
      schoolCity: data.school?.city,
      schoolDepartment: data.school?.department || data.school?.departmentName,
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
      const { user, code, ok } = await api.post("/young/signup2023", values);

      if (!ok) setError({ text: `Une erreur s'est produite : ${translate(code)}` });

      //Tape une 403
      // await api.post(`/young/${user._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED}`, {
      //   cta: `${appURL}/inscription2023`,
      // });

      plausibleEvent("Phase0/CTA preinscription - inscription");
      setData({ ...data, step: PREINSCRIPTION_STEPS.DONE });
      removePersistedData();
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
    <>
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
          {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
          <h1 className="text-2xl text-[#161616] font-semibold">Ces informations sont-elles correctes&nbsp;?</h1>
          <hr className="my-8 h-px bg-gray-200 border-0" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center my-2">
              <div className="text-[#161616] text-lg font-semibold">Mon éligibilité</div>
              <Link to="./eligibilite">
                <EditPen />
              </Link>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-[#666666] text-sm">Niveau de scolarité : </div>
              <div className="text-[#161616] text-base">{translateGrade(data.scolarity)}</div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-[#666666] text-sm">Date de naissance : </div>
              <div className="text-[#161616] text-base">{formatDateFR(data.birthDate)}</div>
            </div>
            {data.school ? (
              <>
                {data.school?.country ? (
                  <div className="flex flex-row justify-between items-center">
                    <div className="text-[#666666] text-sm">Pays de l&apos;établissement</div>
                    <div className="text-[#161616] text-base capitalize">{data.school?.country?.toLowerCase()}</div>
                  </div>
                ) : null}
                {data.school?.city ? (
                  <div className="flex flex-row justify-between items-center">
                    <div className="text-[#666666] text-sm">Commune de l&apos;établissement</div>
                    <div className="text-[#161616] text-base">{data.school.city}</div>
                  </div>
                ) : null}
                <div className="flex flex-row justify-between items-center">
                  <div className="text-[#666666] text-sm">Nom de l&apos;établissement</div>
                  <div className="text-[#161616] text-base">{data.school.fullName}</div>
                </div>
              </>
            ) : (
              <div className="flex flex-row justify-between items-center">
                <div className="text-[#666666] text-sm">Code postal</div>
                <div className="text-[#161616] text-base">{data.zip}</div>
              </div>
            )}

            <div className="flex flex-row justify-between items-center my-2">
              <div className="text-[#161616] text-lg font-semibold">Mes informations personnelles</div>
              <Link to="profil">
                <EditPen />
              </Link>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-[#666666] text-sm">Prénom :</div>
              <div className="text-[#161616] text-base">{data.firstName}</div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-[#666666] text-sm">Nom : </div>
              <div className="text-[#161616] text-base">{data.lastName}</div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-[#666666] text-sm">Email : </div>
              <div className="text-[#161616] text-base">{data.email}</div>
            </div>
            <hr className="my-8 h-px bg-gray-200 border-0" />
            <div className="flex justify-end gap-4">
              <button
                className="flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091] hover:text-white hover:bg-[#000091]"
                onClick={() => history.push("/preinscription/profil")}>
                Précédent
              </button>
              <button
                className={`flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white hover:bg-white hover:!text-[#000091] hover:border hover:border-[#000091]`}
                onClick={() => onSubmit()}>
                M’inscrire au SNU
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
