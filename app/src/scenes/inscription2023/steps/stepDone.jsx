import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Error from "../../../components/error";
import ErrorPic from "../assets/error.png";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../redux/auth/actions";
import { RiEditFill } from "react-icons/ri";
import ConsentDone from "../../../assets/icons/ConsentDone";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import EngagementPrograms from "@/scenes/preinscription/components/EngagementPrograms";
import plausibleEvent from "@/services/plausible";
import useAuth from "@/services/useAuth";
import JDMA from "@/components/JDMA";
import { FaClock } from "react-icons/fa6";
import { Button, SignupButtons } from "@snu/ds/dsfr";
import EmailSend from "@/assets/pictograms/MailSend";

export default function StepWaitingConsent() {
  const { young, logout, isCLE } = useAuth();
  const [disabled, setDisabled] = React.useState(false);
  const [error, setError] = React.useState({});
  const notAuthorised = young?.parentAllowSNU === "false";
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
      const eventName = isCLE ? "CLE/CTA inscription - relancer rep leg" : "Phase0/CTA inscription - relancer rep leg";
      plausibleEvent(eventName);
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
            {isCLE ? "Vous pouvez désormais accéder à votre compte élève" : "Vous pouvez désormais accéder à votre compte volontaire"}
          </p>
          <SignupButtons labelNext="Accéder à mon compte" onClickNext={handleDone} />
        </DSFRContainer>
      ) : (
        <>
          <DSFRContainer title={`${young?.parent1FirstName} ${young?.parent1LastName} a reçu un mail pour approuver votre demande d'inscription.`}>
            {error?.text && <Error {...error} onClose={() => setError({})} />}
            <p className="mt-2 text-sm text-[#666666]">
              {isCLE
                ? "Lorsque votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à votre établissement scolaire pour le valider."
                : "Lorsque votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à l’administration pour le valider."}
            </p>

            <div className="mt-4 flex flex-col gap-1 border-[1px] border-b-4 border-[#E5E5E5] border-b-[#000091] p-6 relative">
              <EmailSend className="absolute right-4 bottom-4 h-16 md:h-auto" />
              <p className="text-sm w-fit rounded-md px-2 py-1 font-bold bg-[#E8EDFF] text-[#0063CB] mb-2">
                <FaClock className="mr-2 inline-block" />
                Consentement en attente
              </p>
              <p className="mt-1 mb-0 text-sm text-[#666666]">
                Un email à été envoyé à <strong className="text-black">{young?.parent1Email}</strong>
              </p>
              <div className="mt-3 flex justify-between">
                <Button className="h-10 w-32 bg-[#000091] text-base text-white disabled:bg-[#E5E5E5]  disabled:text-[#929292] " disabled={disabled} onClick={handleClick}>
                  Renvoyer l'email
                </Button>
              </div>
            </div>
            <span className="flex items-center justify-end">
              <Link className="mt-8 flex items-center justify-end text-blue-france-sun-113" to="/inscription2023/confirm">
                <RiEditFill className="h-5 w-5" />
                Modifier mes informations
              </Link>
            </span>

            {!isCLE && (
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center mt-8 md:mb-4 p-4 bg-[#F5F5FD]">
                <div className="flex flex-col justify-start items-start max-w-md">
                  <p className="m-0 mt-1 text-lg font-semibold">Comment s'est passée votre inscription&nbsp;?</p>
                  <p className="m-0 mt-1 text-sm">Partagez votre expérience et contribuez à l'amélioration de nos services</p>
                </div>
                <div>
                  <JDMA id={3504} />
                </div>
              </div>
            )}
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
        <SignupButtons labelNext="Revenir à l'accueil" onClickNext={logout} />
      </DSFRContainer>
    </>
  );
}
