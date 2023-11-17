import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import GrayArrow from "@/assets/gray-arrow.svg";
import { RiAttachmentFill } from "react-icons/ri";
import plausibleEvent from "../../services/plausible";
import DSFRContainer from "../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../components/dsfr/ui/buttons/SignupButtonContainer";
import ReactMarkdown from "react-markdown";
import { capture } from "../../sentry";
import { supportURL } from "@/config";
import useParcours from "@/services/useParcours";

export default function Done() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const { stepDoneBeforeinscriptionConfig } = useParcours();
  async function handleClick() {
    try {
      plausibleEvent("Phase0/CTA preinscription - finaliser");
      history.push("/inscription2023");
    } catch (e) {
      capture(e);
    }
  }

  return (
    <>
      <DSFRContainer supportLink={supportURL + "/base-de-connaissance/phase-0-les-inscriptions"}>
        <h1 className="text-3xl font-semibold leading-snug">{stepDoneBeforeinscriptionConfig.welcomeText}</h1>
        <h1 className="text-3xl font-semibold leading-snug">{stepDoneBeforeinscriptionConfig.accountCreatedText}</h1>
        <p className="py-2 mt-2 text-gray-600">
          <ReactMarkdown>{stepDoneBeforeinscriptionConfig.finalizeInscription}</ReactMarkdown>
        </p>
        <p className="py-2 text-gray-600">{stepDoneBeforeinscriptionConfig.importantNote}</p>
        {stepDoneBeforeinscriptionConfig.isCniRequested && (
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
        <div className="bg-white fixed md:absolute flex md:flex-col w-full md:w-fit z-10 bottom-20 md:bottom-10 left-0 md:left-80 shadow-ninaInverted md:shadow-none justify-center pt-3 md:py-0 md:items-end gap-2">
          <p className="font-caveat text-xl text-gray-400 font-semibold">Participez au séjour de cohésion</p>
          <img src={GrayArrow} alt="Flèche" className="md:w-10 rotate-90 md:rotate-0 -scale-y-100 md:scale-100" />
        </div>

        <SignupButtonContainer onClickNext={handleClick} labelNext="Finaliser mon inscription" />
      </DSFRContainer>
    </>
  );
}
