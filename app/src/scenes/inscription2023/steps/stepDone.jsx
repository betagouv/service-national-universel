import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Error from "../../../components/error";
import Avatar from "../assets/avatar.png";
import ErrorPic from "../assets/error.png";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../redux/auth/actions";
import EditPen from "../../../assets/icons/EditPen";
import ConsentDone from "../../../assets/icons/ConsentDone";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";
import EngagementPrograms from "@/scenes/preinscription/components/EngagementPrograms";
import plausibleEvent from "@/services/plausible";
import { YOUNG_SOURCE } from "snu-lib";

export default function StepWaitingConsent() {
  const young = useSelector((state) => state.Auth.young);
  const [disabled, setDisabled] = React.useState(false);
  const [error, setError] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const notAuthorised = young?.parentAllowSNU === "false";
  const isCle = YOUNG_SOURCE.CLE === young.source;
  const history = useHistory();
  const dispatch = useDispatch();

  const handleClick = async () => {
    setDisabled(true);
    try {
      const { ok, code } = await api.put(`/young/inscription2023/relance`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setDisabled(false);
        return;
      }
      plausibleEvent("Phase0/CTA inscription - relancer rep leg");
      toastr.success("Succès", "Votre relance a bien été prise en compte.");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
      setDisabled(false);
    }
  };

  const handleDone = async () => {
    setDisabled(true);
    try {
      const { ok, code, data } = await api.put(`/young/inscription2023/done`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setDisabled(false);
        return;
      }
      dispatch(setYoung(data));
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
      setDisabled(false);
    }
  };
  // utiliser le useAuth pour logout
  const logout = async () => {
    setLoading(true);
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  return !notAuthorised ? (
    <>
      {young?.parentAllowSNU === "true" ? (
        <DSFRContainer
          title={
            <div className="flex items-center gap-4">
              <ConsentDone />
              <h1 className="flex-1 text-[22px] font-bold">Bravo, nous allons étudier votre dossier !</h1>
            </div>
          }>
          <p className="text-base text-[#161616] ">
            Bonne nouvelle, votre représentant légal a <strong>déjà donné son consentement.</strong>
          </p>
          <p className="mt-2 text-base text-[#161616]">
            {isCle ? "Vous pouvez désormais accéder à votre compte élève" : "Vous pouvez désormais accéder à votre compte volontaire"}
          </p>
          <SignupButtonContainer labelNext="Accéder à mon compte" onClickNext={handleDone} />
        </DSFRContainer>
      ) : (
        <>
          <DSFRContainer title="Bravo, vous avez terminé votre inscription.">
            {error?.text && <Error {...error} onClose={() => setError({})} />}
            <p className="mt-2 text-sm text-[#666666]">
              {isCle
                ? "Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à votre établissement scolaire pour le valider."
                : "Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à l’administration pour le valider."}
            </p>

            <div className="mt-4 flex flex-col gap-1 border-[1px] border-b-4 border-[#E5E5E5] border-b-[#000091] p-4">
              <div className="text-base font-bold text-[#161616]">En attente du consentement de :</div>
              <div className="text-base text-[#3A3A3A] ">
                {young?.parent1FirstName} {young.parent1LastName}
              </div>
              <div className="text-sm text-[#666666] ">{young?.parent1Email}</div>
              <div className="mt-2 flex justify-between">
                <button
                  className="mt-2 h-10 w-1/2 bg-[#000091] text-base text-white disabled:bg-[#E5E5E5]  disabled:text-[#929292] "
                  disabled={disabled}
                  onClick={() => handleClick()}>
                  Relancer
                </button>
                <img className="translate-y-4" src={Avatar} />
              </div>
            </div>
            <div className="my-4 flex cursor-pointer items-center justify-end gap-2 text-base text-[#000091]" onClick={() => history.push("/inscription2023/confirm")}>
              <EditPen />
              Modifier mes informations
            </div>
            {!isCle && (
              <div className="flex w-full justify-end">
                <a className="w-36" href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3504?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f">
                  <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" />
                </a>
              </div>
            )}
            <SignupButtonContainer labelNext="Revenir à l'accueil" onClickNext={() => logout()} />
          </DSFRContainer>
        </>
      )}
    </>
  ) : (
    <>
      <DSFRContainer
        title={
          <div className="flex items-center gap-4">
            <img src={ErrorPic} />
            <h1 className="text-xl font-bold">Mauvaise nouvelle...</h1>
          </div>
        }>
        <div className="text-base text-[#161616]">
          Malheureusement votre représentant légal n&apos;a <strong>pas consenti</strong> à votre participation au SNU.
          <br />
          <br />
          Mais tout n’est pas perdu, il existe d’autres moyens de s’engager ! Découvrez-les maintenant.
        </div>
        <EngagementPrograms />
        <SignupButtonContainer labelNext="Revenir à l'accueil" onClickNext={() => logout()} disabled={loading} />
      </DSFRContainer>
    </>
  );
}
