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

export default function StepDone() {
  const [data] = React.useContext(PreInscriptionContext);
  const history = useHistory();
  const dispatch = useDispatch();

  const logout = async () => {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    history.push("/");
  };

  async function handleClick() {
    try {
      const { user: young, token } = await api.post(`/young/signin`, { email: data.email, password: data.password });
      if (young) {
        if (token) api.setToken(token);
        dispatch(setYoung(young));
        plausibleEvent("Phase0/CTA preinscription - demarrer");
        history.push("/inscription2023");
      }
    } catch (e) {
      capture(e);
    }
  }

  return (
    <>
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
          <h1 className="text-4xl text-[#161616]">
            Bienvenue {data.firstName} !<br /> Vous avez complété votre <br />
            pré-inscription.
          </h1>

          <div className="mt-4 text-[#3A3A3A] text-sm">
            Vous pouvez dès à présent <strong>compléter</strong> votre inscription ou <strong>reprendre à tout moment</strong> depuis le mail envoyé à {data.email}, ou depuis
            &quot;Se connecter&quot;
          </div>
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
          <hr className="my-8 h-px bg-gray-200 border-0" />
          <div className="flex justify-end gap-4">
            <button
              className="flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091] hover:text-white hover:bg-[#000091]"
              onClick={() => logout()}>
              Plus tard
            </button>
            <button
              className={`flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white hover:bg-white hover:!text-[#000091] hover:border hover:border-[#000091]`}
              onClick={handleClick}>
              Continuer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
