import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import plausibleEvent from "../../services/plausible";
import DSFRContainer from "../../components/inscription/DSFRContainer";
import Input from "../../components/inscription/input";
import SignupButtonContainer from "../../components/inscription/SignupButtonContainer";
import { capture } from "../../sentry";
import InlineButton from "./components/InlineButton";
import DidNotReceiveActivationCodeModal from "./components/DidNotReceiveActivationCodeModal";
import ModifyEmailModal from "./components/ModifyEmailModal";

export default function StepEmailValidation() {
  const dispatch = useDispatch();
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState("");
  const [emailValidationToken, setEmailValidationToken] = useState("");
  const [isDidNotReceiveCodeModalOpen, setDidNotReceiveCodeModalOpen] = useState(false);
  const [isModifyEmailModalOpen, setModifyEmailOpen] = useState(false);

  async function handleClick() {
    try {
      if (!emailValidationToken) {
        return setError("Merci d'entrer le code d'activation ");
      }
      const { code, ok, token, user } = await api.post("/young/email-validation", { token_email_validation: emailValidationToken });
      if (!ok) {
        setError(`Une erreur s'est produite : ${translate(code)}`);
      }
      if (token) api.setToken(token);
      if (user) dispatch(setYoung(user));
      plausibleEvent("Phase0/CTA preinscription - validation email");
      history.push("/preinscription/done");
    } catch (e) {
      capture(e);
      setError(`Une erreur s'est produite : ${translate(e.code)}`);
    }
  }

  async function handleRequestNewToken() {
    try {
      const { code, ok } = await api.get("/young/email-validation/token");
      if (!ok) {
        setError(`Une erreur s'est produite : ${translate(code)}`);
      } else {
        toastr.success("Un nouveau code d'activation vous a été envoyé par e-mail", "");
        setModifyEmailOpen(false);
      }
    } catch (e) {
      capture(e);
      toastr.error(`Une erreur s'est produite : ${translate(e.code)}`, "");
    }
  }

  async function handleRequestEmailChange(email) {
    try {
      const { code, ok, user } = await api.post("/young/signup/email", { email });
      if (!ok) {
        toastr.error(`Une erreur s'est produite : ${translate(code)}`, "");
      } else {
        dispatch(setYoung(user));

        toastr.success("Votre adresse mail a bien été mise à jour et un code d'activation vous a été envoyé à cette adresse", "");
      }
    } catch (e) {
      capture(e);
      toastr.error(`Une erreur s'est produite : ${translate(e.code)}`, "");
    }
  }

  return (
    <DSFRContainer>
      <DidNotReceiveActivationCodeModal
        onRequestNewToken={handleRequestNewToken}
        isOpen={isDidNotReceiveCodeModalOpen}
        onClose={() => setDidNotReceiveCodeModalOpen(false)}
        onRequestEmailModification={() => {
          setDidNotReceiveCodeModalOpen(false);
          setModifyEmailOpen(true);
        }}
      />
      <ModifyEmailModal isOpen={isModifyEmailModalOpen} onClose={() => setModifyEmailOpen(false)} onEmailChange={handleRequestEmailChange} />
      <h1 className="text-2xl font-semibold text-[#161616]">Entrer le code d'activation</h1>
      <p className="mt-4 text-[#3A3A3A]">
        Pour valider la création de votre compte volontaire, vous devez entrer le code d’activation reçu sur la boîte mail <strong>{young?.email}</strong>
        <InlineButton
          onClick={() => {
            setModifyEmailOpen(true);
          }}
          className="ml-1"
        />
      </p>
      <div className="mt-8 flex flex-col gap-1">
        <label>Code d'activation reçu par e-mail</label>
        <Input value={emailValidationToken} onChange={setEmailValidationToken} />
        <div className="h-2">
          {error && (
            <span className="text-sm text-red-500">
              {error}{" "}
              <InlineButton className="ml-1 text-sm text-red-500 hover:text-red-700" onClick={handleRequestNewToken}>
                Recevoir un nouveau code
              </InlineButton>
            </span>
          )}
        </div>
      </div>
      <InlineButton
        className="mt-3"
        onClick={() => {
          setDidNotReceiveCodeModalOpen(true);
        }}>
        Je n'ai rien reçu
      </InlineButton>
      <SignupButtonContainer onClickNext={handleClick} labelNext="Activer mon compte volontaire" />
    </DSFRContainer>
  );
}
