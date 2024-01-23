import React from "react";
import { useHistory } from "react-router-dom";
import GrayArrow from "@/assets/gray-arrow.svg";
import { RiAttachmentFill } from "react-icons/ri";
import plausibleEvent from "../../services/plausible";
import DSFRContainer from "../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../components/dsfr/ui/buttons/SignupButtonContainer";
import { capture } from "../../sentry";
import { supportURL } from "@/config";
import useAuth from "@/services/useAuth";

export default function Done() {
  const { young, isCLE } = useAuth();
  const history = useHistory();
  async function handleClick() {
    try {
      const eventName = isCLE ? "CLE/CTA preinscription - finaliser" : "Phase0/CTA preinscription - finaliser";
      plausibleEvent(eventName);
      history.push("/inscription2023");
    } catch (e) {
      capture(e);
    }
  }

  return (
    <>
      <DSFRContainer supportLink={supportURL + "/base-de-connaissance/phase-0-les-inscriptions"}>
        <h1 className="text-3xl font-semibold leading-snug">Bienvenue {young.firstName} 🎉</h1>
        <h1 className="text-3xl font-semibold leading-snug">{isCLE ? "Votre compte élève a été créé." : "Votre compte volontaire a été créé."}</h1>
        <p className="py-2 mt-2 text-gray-600">
          {" "}
          Vous pouvez dès à présent <strong>finaliser votre inscription</strong> ou la reprendre à tout moment depuis le mail envoyé à {young.email}, ou depuis l’écran de
          connexion.
        </p>
        <p className="py-2 text-gray-600">Attention, une inscription complète est indispensable pour valider votre candidature au SNU.</p>
        {!isCLE && (
          <>
            <hr className="mt-4" />
            <h2 className="text-lg font-semibold">Préparez le document suivant :</h2>
            <div className="flex py-2 gap-3 mb-2">
              <div className="flex-none">
                <RiAttachmentFill className="text-2xl pt-1 text-blue-france-sun-113" aria-label="Icône trombone" />
              </div>
              <div className="space-y-2">
                <p>Pièce d&apos;identité</p>
                <p className="text-xs text-gray-500">Carte Nationale d’Identité ou Passeport</p>
              </div>
            </div>
          </>
        )}
        <div className="bg-white fixed md:absolute flex md:flex-col w-full md:w-fit z-10 bottom-20 left-0 md:left-80 shadow-ninaInverted md:shadow-none justify-center pt-3 md:py-0 md:items-end gap-2">
          <p className="font-caveat text-xl text-gray-400 font-semibold">Participez au séjour de cohésion</p>
          <img src={GrayArrow} alt="Flèche" className="md:w-10 rotate-90 md:rotate-0 -scale-y-100 md:scale-100" />
        </div>

        <SignupButtonContainer onClickNext={handleClick} labelNext="Finaliser mon inscription" />
      </DSFRContainer>
    </>
  );
}
