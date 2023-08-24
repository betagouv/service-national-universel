import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import CompleteInscription from "../../assets/icons/CompleteInscription";
import { GrAttachment } from "react-icons/gr";
import plausibleEvent from "../../services/plausible";
import DSFRContainer from "../../components/inscription/DSFRContainer";
import SignupButtonContainer from "../../components/inscription/SignupButtonContainer";
import { capture } from "../../sentry";

export default function StepDone() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  async function handleClick() {
    try {
      plausibleEvent("Phase0/CTA preinscription - demarrer");
      history.push("/inscription");
    } catch (e) {
      capture(e);
    }
  }

  return (
    <DSFRContainer>
      <h1 className="text-2xl font-semibold text-[#161616]">Bienvenue {young.firstName} ! Vous avez complété votre pré-inscription.</h1>
      <p className="mt-4 text-sm text-[#3A3A3A]">
        Vous pouvez dès à présent <strong>compléter</strong> votre inscription ou <strong>la reprendre à tout moment</strong> depuis le mail envoyé à {young.email}, ou depuis
        &quot;Se connecter&quot;
      </p>
      <div className="mt-4 border-x-[1px] border-t-[1px] border-b-4 border-b-[#000091] px-3 pt-2 pb-7">
        <CompleteInscription />
        <div className="mt-4 text-base font-semibold text-[#161616]">Finalisez votre inscription en 8 minutes</div>
        <div className="mt-2 text-sm">Vous pouvez d&apos;ores et déjà préparer le document suivant :</div>
        <div className="mt-4 flex flex-row items-center gap-4">
          <div className="flex items-center rounded-full bg-[#EEEEEE] p-2">
            <GrAttachment className="text-[#3A3A3A]" />
          </div>
          <div className="text-sm text-[#3A3A3A]">Carte d&apos;identité ou passeport</div>
        </div>
      </div>
      <SignupButtonContainer onClickNext={handleClick} labelNext="Compléter mon inscription" />
    </DSFRContainer>
  );
}
