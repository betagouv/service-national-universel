import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import CompleteInscription from "../../../assets/icons/CompleteInscription";
import { GrAttachment } from "react-icons/gr";
import api from "../../../services/api";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import plausibleEvent from "../../../services/plausible";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { capture } from "../../../sentry";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";

export default function StepDone() {
  // eslint-disable-next-line no-unused-vars
  const [data, _, removePersistedData] = React.useContext(PreInscriptionContext);
  const dispatch = useDispatch();

  async function handleClick() {
    try {
      plausibleEvent("Phase0/CTA preinscription - demarrer");
      const { user: young, token } = await api.post(`/young/signin`, { email: data.email, password: data.password });
      if (young) {
        if (token) api.setToken(token);
        dispatch(setYoung(young));
        removePersistedData(true);
      }
    } catch (e) {
      capture(e);
    }
  }

  return (
    <>
      <ProgressBar />
      <DSFRContainer supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}>
        <h1 className="text-2xl font-semibold text-[#161616]">Bienvenue {data.firstName} ! Vous avez complété votre pré-inscription.</h1>
        <p className="mt-4 text-sm text-[#3A3A3A]">
          Vous pouvez dès à présent <strong>compléter</strong> votre inscription ou <strong>la reprendre à tout moment</strong> depuis le mail envoyé à {data.email}, ou depuis
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
    </>
  );
}
