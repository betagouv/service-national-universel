import React, { useState } from "react";
import EditPen from "../../../assets/icons/EditPen";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import StickyButton from "../../../components/inscription/stickyButton";
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
import { appURL } from "../../../config";
import { translate, translateGrade, formatDateFR } from "snu-lib";
import plausibleEvent from "../../../services/plausible";
import { SENDINBLUE_TEMPLATES } from "../../../utils";
import Error from "../../../components/error";

export default function StepDone() {
  const [error, setError] = useState({});
  // const [data] = React.useContext(PreInscriptionContext);
  const data = {
    acceptCGU: "true",
    birthDate: "2007-01-01",
    cohort: "Avril 2023 - B",
    confirmPassword: "123!@#qweQWE",
    email: "bob@bob.com",
    emailConfirm: "bob@bob.com",
    firstName: "bob",
    frenchNationality: "true",
    lastName: "bob",
    password: "123!@#qweQWE",
    rulesYoung: "true",
    school: {
      adresse: "3 allée des Collèges",
      city: "Bourges",
      codeCity: "18033",
      codePays: "100",
      country: "FRANCE",
      createdAt: "2022-09-30T12:30:29.445Z",
      data: {
        ADMINISTRATION: { DATE_MAJ: "2022-06-22", CODE_INSEE_COMMUNE: "18033", CODE_APET: "8531Z", MINISTERES_TUTELLES: Array(1), TYPES_ETABLISSEMENTS: Array(1) },
        DATE_PRODUCTION: "2022-09-29",
        IDENTIFICATION: { DATE_MAJ: "2022-06-22", NUMERO_UAI: "0180673J", ETAT: "1", CODE_ACADEMIE: "18", CODE_DEPARTEMENT: "018" },
        LOCALISATION: { DATE_MAJ: "2022-06-22", CODE_POSTAL: "18028", BOITE_POSTALE: "4029", LOCALITE_ACHEMINEMENT: "BOURGES CEDEX", TELEPHONE: "0248271460" },
      },
      department: "018",
      departmentName: "Cher",
      fullName: "Collège Jules Verne",
      postcode: "18028",
      region: "Centre-Val de Loire",
      type: "CLG",
      uai: "0180673J",
      updatedAt: "2022-09-30T12:30:29.445Z",
      __v: 0,
      _id: "6336e165628add2921804288",
    },
    scolarity: "SECOND",
  };

  const history = useHistory();

  const onSubmit = async () => {
    try {
      // signup
      const { user, token, code, ok } = await api.post("/young/signup2023", {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        frenchNationality: data.frenchNationality,
        password: data.password,
        birthdateAt: data.birthDate,
        schooled: data.school ? "true" : "false",
        schoolName: data.school.fullName,
        schoolType: data.school.type,
        schoolAddress: data.school.adresse,
        schoolZip: data.school.codeCity,
        schoolCity: data.school.city,
        schoolDepartment: data.school.departmentName,
        schoolRegion: data.school.region,
        schoolCountry: data.school.country,
        schoolId: data.school._id,
      });

      if (!ok) setError({ text: `Une erreur s'est produite : ${translate(code)}` });

      // signin
      // if (token) api.setToken(token);
      // dispatch(setYoung(user));

      // notif
      await api.post(`/young/${user._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED}`, {
        cta: `${appURL}/inscription2023`,
      });

      // plausible
      plausibleEvent("");

      history.push("/preinscription/done");
    } catch (e) {
      console.log(e);
      if (e.code === "USER_ALREADY_REGISTERED")
        setError({ text: "Vous avez déjà un compte sur la plateforme SNU, renseigné avec ces informations (prénom, nom et date de naissance)." });
      else setError({ text: e.code });
    }
  };

  return (
    <>
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <h1 className="text-xl text-[#161616]">Ces informations sont-elles correctes&nbsp;?</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#161616] text-lg">Mes informations personnelles</div>
            <EditPen />
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
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Niveau de scolarité : </div>
            <div className="text-[#161616] text-base">{translateGrade(data.scolarity)}</div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Date de naissance : </div>
            <div className="text-[#161616] text-base">{formatDateFR(data.birthDate)}</div>
          </div>
        </div>
      </div>
      <StickyButton text="M'inscrire au SNU" onClick={() => onSubmit()} onClickPrevious={() => history.push("/preinscription/profil")} />
    </>
  );
}
