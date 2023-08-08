import React, { useState } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";

// import api from "../../../services/api";

import DSFRContainer from "../../../components/inscription/DSFRContainer";
import Input from "../../../components/inscription/input";
import SignupButtonContainer from "../../../components/inscription/SignupButtonContainer";
import { capture } from "../../../sentry";
import InlineButton from "../components/InlineButton";
import DidNotReceiveActivationCodeModal from "../components/DidNotReceiveActivationCodeModal";
import ModifyEmailModal from "../components/ModifyEmailModal";

export default function StepEmailValidation() {
  // eslint-disable-next-line no-unused-vars
  const [data, _] = React.useContext(PreInscriptionContext);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [isDidNotReceiveCodeModalOpen, setDidNotReceiveCodeModalOpen] = useState(true);
  const [isModifyEmailModalOpen, setModifyEmailOpen] = useState(false);

  async function handleClick() {
    try {
      console.log("TODO: call api to activate account");
    } catch (e) {
      capture(e);
    }
  }

  return (
    <DSFRContainer>
      <DidNotReceiveActivationCodeModal isOpen={isDidNotReceiveCodeModalOpen} onClose={() => setDidNotReceiveCodeModalOpen(false)} />
      <ModifyEmailModal isOpen={isModifyEmailModalOpen} onClose={() => setModifyEmailOpen(false)} />
      <h1 className="text-2xl font-semibold text-[#161616]">Entrer le code d'activation</h1>
      <p className="mt-4 text-[#3A3A3A]">
        Pour valider la création de votre compte volontaire, vous devez entrer le code d’activation reçu sur la boîte mail <strong>{data.email}</strong>
        <InlineButton onClick={() => {}} className="ml-1" />
      </p>
      <div className="mt-8 flex flex-col gap-1">
        <label>Code d'activation reçu par e-mail</label>
        <Input value={code} onChange={setCode} />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
      <InlineButton className="mt-3" onClick={() => {}}>
        Je n'ai rien reçu
      </InlineButton>

      <SignupButtonContainer onClickNext={handleClick} disabled={!code} labelNext="Activer mon compte volontaire" />
    </DSFRContainer>
  );
}
