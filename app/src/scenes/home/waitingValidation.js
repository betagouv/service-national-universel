import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import Clock from "../../assets/icons/Clock";
import { setYoung } from "../../redux/auth/actions";
import { capture } from "../../sentry";
import API from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { inscriptionModificationOpenForYoungs, translate, YOUNG_STATUS, PHASE1_YOUNG_ACCESS_LIMIT, formatDateFR } from "../../utils";

export default function WaitingValidation() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();

  const goToInscription = async () => {
    try {
      const { ok, code, data } = await API.put(`/young/inscription2023/goToInscriptionAgain`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue :", translate(code));
        return;
      }
      dispatch(setYoung(data));
      history.push("/inscription2023/profil");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="m-10 w-full">
          <div className="flex justify-between items-center rounded-xl bg-white ">
            <div className="flex flex-col gap-8 w-1/2 pl-10 py-6 pr-3">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="text-[#242526] font-bold text-xl mt-2">Merci, votre inscription a bien été enregistrée.</div>
              <hr className="text-gray-200" />
              <div className="flex items-center gap-5">
                <div className="h-8 w-8">
                  <Clock />
                </div>
                <div className="text-[#6B7280] text-sm leading-5">
                  Votre dossier est en cours de traitement par l’administration. Vous recevrez prochainement un e-mail de no-reply@snu.gouv.fr vous informant de l&apos;avancement
                  de votre inscription.
                </div>
              </div>
              <hr className="text-gray-200" />
              <div className="text-[#6B7280] ml-2 text-sm leading-5">
                Vous pouvez modifier votre dossier <b>jusqu’à la validation de votre inscription</b> et au plus tard{" "}
                <b>jusqu’au {formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus.</b>
              </div>
              <div>
                {young.status === YOUNG_STATUS.WAITING_VALIDATION && inscriptionModificationOpenForYoungs(young.cohort) && (
                  <button
                    className="rounded-lg border-[1px] py-2.5 px-3  hover:!bg-blue-600 bg-white border-blue-600 hover:!text-white !text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                    onClick={goToInscription}>
                    Consulter mon dossier d’inscription
                  </button>
                )}
              </div>
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
          </div>
          <div className="flex justify-end mt-10">
            <a
              className="w-40"
              href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
              onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
              <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
            </a>
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex flex-col lg:hidden w-full">
        <div className="flex flex-col-reverse bg-white">
          <div className="flex flex-col gap-4 px-4 pb-8   ">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="text-[#242526] font-bold text-lg mt-3">Merci, votre inscription a bien été enregistrée.</div>
            <hr className="text-gray-200 mt-3" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8">
                <Clock />
              </div>
              <div className="text-[#738297] text-sm">
                Votre dossier est en cours de traitement par l’administration. Vous recevrez prochainement un e-mail de no-reply@snu.gouv.fr vous informant de l&apos;avancement de
                votre inscription.
              </div>
            </div>
            <hr className="text-gray-200" />
            <div className="text-[#6B7280] text-sm leading-5">
              Vous pouvez modifier votre dossier <b>jusqu’à la validation de votre inscription</b> et au plus tard{" "}
              <b>jusqu’au {formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus.</b>
            </div>
            {young.status === YOUNG_STATUS.WAITING_VALIDATION && inscriptionModificationOpenForYoungs(young.cohort) && (
              <button
                className="mt-4 rounded-lg border-[1px] py-2.5 px-3  hover:!bg-blue-600 bg-white border-blue-600 hover:!text-white !text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                onClick={goToInscription}>
                Consulter mon dossier d’inscription
              </button>
            )}
            <div className="flex justify-center mt-20">
              <a
                className="w-36"
                href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
                onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
                <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
              </a>
            </div>
          </div>
          <img className="object-contain" src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
