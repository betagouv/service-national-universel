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
          <div className="flex items-center justify-between rounded-xl bg-white ">
            <div className="flex w-1/2 flex-col gap-8 py-6 pl-10 pr-3">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="mt-2 text-xl font-bold text-[#242526]">Merci, votre inscription a bien été enregistrée.</div>
              <hr className="text-gray-200" />
              <div className="flex items-center gap-5">
                <div className="h-8 w-8">
                  <Clock />
                </div>
                <div className="text-sm leading-5 text-[#6B7280]">
                  Votre dossier est en cours de traitement par l’administration. Vous recevrez prochainement un e-mail de no-reply@snu.gouv.fr vous informant de l&apos;avancement
                  de votre inscription.
                </div>
              </div>
              <hr className="text-gray-200" />
              <div className="ml-2 text-sm leading-5 text-[#6B7280]">
                Vous pouvez modifier votre dossier <b>jusqu’à la validation de votre inscription</b> et au plus tard{" "}
                <b>jusqu’au {formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus.</b>
              </div>
              <div>
                {young.status === YOUNG_STATUS.WAITING_VALIDATION && inscriptionModificationOpenForYoungs(young.cohort) && (
                  <button
                    className="rounded-lg border-[1px] border-blue-600 bg-white  py-2.5 px-3 text-sm font-medium leading-5 !text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white"
                    onClick={goToInscription}>
                    Consulter mon dossier d’inscription
                  </button>
                )}
              </div>
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
          </div>
          <div className="mt-10 flex justify-end">
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
      <div className="flex w-full flex-col lg:hidden">
        <div className="flex flex-col-reverse bg-white">
          <div className="flex flex-col gap-4 px-4 pb-8   ">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="mt-3 text-lg font-bold text-[#242526]">Merci, votre inscription a bien été enregistrée.</div>
            <hr className="mt-3 text-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8">
                <Clock />
              </div>
              <div className="text-sm text-[#738297]">
                Votre dossier est en cours de traitement par l’administration. Vous recevrez prochainement un e-mail de no-reply@snu.gouv.fr vous informant de l&apos;avancement de
                votre inscription.
              </div>
            </div>
            <hr className="text-gray-200" />
            <div className="text-sm leading-5 text-[#6B7280]">
              Vous pouvez modifier votre dossier <b>jusqu’à la validation de votre inscription</b> et au plus tard{" "}
              <b>jusqu’au {formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus.</b>
            </div>
            {young.status === YOUNG_STATUS.WAITING_VALIDATION && inscriptionModificationOpenForYoungs(young.cohort) && (
              <button
                className="mt-4 rounded-lg border-[1px] border-blue-600 bg-white  py-2.5 px-3 text-sm font-medium leading-5 !text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white"
                onClick={goToInscription}>
                Consulter mon dossier d’inscription
              </button>
            )}
            <div className="mt-20 flex justify-center">
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
