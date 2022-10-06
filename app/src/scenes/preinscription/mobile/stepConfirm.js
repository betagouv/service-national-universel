import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import api from "../../../services/api";
import { appURL } from "../../../config";
import { translate, translateGrade, formatDateFR } from "snu-lib";
import plausibleEvent from "../../../services/plausible";
import { SENDINBLUE_TEMPLATES } from "../../../utils";
import EditPen from "../../../assets/icons/EditPen";
import Error from "../../../components/error";
import StickyButton from "../../../components/inscription/stickyButton";
import { capture } from "../../../sentry";

export default function StepDone() {
  const [error, setError] = useState({});
  const [data] = React.useContext(PreInscriptionContext);

  const history = useHistory();

  const onSubmit = async () => {
    try {
      const { user, code, ok } = await api.post("/young/signup2023", {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        frenchNationality: data.frenchNationality,
        password: data.password,
        birthdateAt: data.birthDate,
        schooled: data.school ? "true" : "false",
        schoolName: data.school?.fullName,
        schoolType: data.school?.type,
        schoolAddress: data.school?.adresse,
        schoolZip: data.school?.codeCity,
        schoolCity: data.school?.city,
        schoolDepartment: data.school?.departmentName,
        schoolRegion: data.school?.region,
        schoolCountry: data.school?.country,
        schoolId: data.school?._id,
        zip: data.zip,
        // cohort: data.cohort,
      });

      if (!ok) setError({ text: `Une erreur s'est produite : ${translate(code)}` });

      await api.post(`/young/${user._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED}`, {
        cta: `${appURL}/inscription2023`,
      });

      plausibleEvent("");

      history.push("/preinscription/done");
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED")
        setError({ text: "Vous avez déjà un compte sur la plateforme SNU, renseigné avec ces informations (prénom, nom et date de naissance)." });
      else {
        capture(e);
        setError({ text: e.code });
      }
    }
  };

  return (
    <>
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <h1 className="text-xl text-[#161616] font-semibold">Ces informations sont-elles correctes&nbsp;?</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center my-2">
            <div className="text-[#161616] text-lg font-semibold">Mon éligibilité</div>
            <Link to=".">
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
              <div className="flex flex-row justify-between items-center">
                <div className="text-[#666666] text-sm">Pays de l&apos;établissement</div>
                <div className="text-[#161616] text-base capitalize">{data.school.country.toLowerCase()}</div>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div className="text-[#666666] text-sm">Commune de l&apos;établissement</div>
                <div className="text-[#161616] text-base">{data.school.city}</div>
              </div>
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
        </div>
      </div>
      <StickyButton text="M'inscrire au SNU" onClick={() => onSubmit()} onClickPrevious={() => history.push("/preinscription/profil")} />
    </>
  );
}
