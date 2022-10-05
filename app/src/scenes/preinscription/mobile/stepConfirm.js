import React from "react";
import EditPen from "../../../assets/icons/EditPen";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import StickyButton from "../../../components/inscription/stickyButton";
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
import { appURL } from "../../../config";
import { translateGrade, formatDateFR } from "snu-lib";
import plausibleEvent from "../../../services/plausible";
import { SENDINBLUE_TEMPLATES } from "../../../utils";

export default function StepDone() {
  const [data] = React.useContext(PreInscriptionContext);
  const history = useHistory();

  const onSubmit = async () => {
    // create young
    try {
      const { email, firstName, lastName, password, birthdateAt, birthCountry, birthCity, birthCityZip, frenchNationality, rulesYoung, acceptCGU } = values;
      const route = "/young/signup";
      const { user, token, code, ok } = await api.post(route, {
        email,
        firstName,
        lastName,
        password,
        birthdateAt,
        birthCountry,
        birthCity,
        birthCityZip,
        frenchNationality,
        rulesYoung,
        acceptCGU,
      });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      if (token) api.setToken(token);
      dispatch(setYoung(user));
      await api.post(`/young/${user._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED}`);
      history.push("/inscription/coordonnees");
    } catch (e) {
      console.log(e);
      if (e.code === "USER_ALREADY_REGISTERED")
        return toastr.error("Vous avez déjà un compte sur la plateforme SNU, renseigné avec ces informations (prénom, nom et date de naissance).", "", {
          timeOut: 30000,
          component: (
            <p>
              Si vous ne vous souvenez plus de votre identifiant (email),{" "}
              <a
                href={`${supportURL}/base-de-connaissance/comment-recuperer-mon-identifiant-dossier-deja-inscrit-1`}
                target="_blank"
                style={{ color: "white", textDecoration: "underline" }}
                rel="noreferrer">
                cliquez ici.
              </a>
            </p>
          ),
        });
    const res = await {};
    // notif
    await api.post(`/young/${res.data._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED}`, {
      cta: `${appURL}/inscription2023`,
    });
    // plausible
    plausibleEvent("");

    history.push("/preinscription/done");
  };

  return (
    <>
      <div className="bg-white p-4">
        <h1 className="text-xl text-[#161616]">Ces informations sont correctes ?</h1>
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
