import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import CompleteInscription from "../../../assets/icons/CompleteInscription";
import { GrAttachment } from "react-icons/gr";
import api from "../../../services/api";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import plausibleEvent from "../../../services/plausible";
import DSFRContainer from "../../../components/DSFRContainer";
import SignupButtonContainer from "../../../components/SignupButtonContainer";

export default function StepDone() {
  // eslint-disable-next-line no-unused-vars
  const [data, _, removePersistedData] = React.useContext(PreInscriptionContext);
  const history = useHistory();
  const dispatch = useDispatch();

  const logout = async () => {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    removePersistedData(true);
    history.push("/");
  };

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
    <DSFRContainer showHelp={false}>
      <h1 className="text-2xl font-semibold text-[#161616]">Bienvenue {data.firstName} ! Vous avez complété votre pré-inscription.</h1>
      <p className="mt-4 text-[#3A3A3A] text-sm">
        Vous pouvez dès à présent <strong>compléter</strong> votre inscription ou <strong>la reprendre à tout moment</strong> depuis le mail envoyé à {data.email}, ou depuis
        &quot;Se connecter&quot;
      </p>
      <div className="mt-4 border-x-[1px] border-t-[1px] border-b-4 border-b-[#000091] px-3 pt-2 pb-7">
        <CompleteInscription />
        <div className="text-base text-[#161616] font-semibold mt-4">Finalisez votre inscription en 8 minutes</div>
        <div className="text-sm mt-2">Vous pouvez d&apos;ores et déjà préparer le document suivant :</div>
        <div className="flex flex-row items-center mt-4 gap-4">
          <div className="flex items-center p-2 rounded-full bg-[#EEEEEE]">
            <GrAttachment className="text-[#3A3A3A]" />
          </div>
          <div className="text-[#3A3A3A] text-sm">Pièce d’identité (ou passeport)</div>
        </div>
      </div>
      <SignupButtonContainer onClickNext={handleClick} labelNext="Continuer mon inscription" onClickPrevious={logout} labelPrevious="Plus tard" />
    </DSFRContainer>
  );
}
