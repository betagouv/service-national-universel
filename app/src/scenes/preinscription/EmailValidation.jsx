import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, Redirect, useLocation } from "react-router-dom";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import queryString from "query-string";

import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import plausibleEvent from "../../services/plausible";
import DSFRContainer from "../../components/dsfr/layout/DSFRContainer";
import Input from "../../components/dsfr/forms/input";
import { capture } from "../../sentry";
import InlineButton from "../../components/dsfr/ui/buttons/InlineButton";
import DidNotReceiveActivationCodeModal from "./components/DidNotReceiveActivationCodeModal";
import ModifyEmailModal from "./components/ModifyEmailModal";
import useAuth from "@/services/useAuth";
import { SignupButtons } from "@snu/ds/dsfr";
import { emailValidationNoticeModal, updateEmailModal } from "./components/Modals";

//@todo:
// - move from preinscription folder to be reused for "class engagee" also /preinscription/email-validation => /email-validation
// - add origin to query params to know where to redirect user after email validation (preinscription or class engagee)
export default function StepEmailValidation() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { search } = useLocation();
  const { token } = queryString.parse(search);
  const { young, isCLE } = useAuth();
  const [error, setError] = useState("");
  const [emailValidationToken, setEmailValidationToken] = useState(token || "");

  if (young && young.emailVerified === "true") return <Redirect to="/inscription" />;

  async function handleClick() {
    try {
      if (!emailValidationToken) {
        return setError("Merci d'entrer le code d'activation ");
      }
      const { code, ok, user } = await api.post("/young/email-validation", { token_email_validation: emailValidationToken });
      if (!ok) {
        setError(`Une erreur s'est produite : ${translate(code)}`);
      }
      if (user) dispatch(setYoung(user));
      const eventName = isCLE ? "CLE/CTA preinscription - validation email" : "Phase0/CTA preinscription - validation email";
      plausibleEvent(eventName);
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
        toastr.error(`Une erreur s'est produite : ${translate(code)}`, "");
        return;
      }
      toastr.success("Un nouveau code d'activation vous a été envoyé par e-mail", "", { timeOut: 6000 });
    } catch (e) {
      capture(e);
      toastr.error(`Une erreur s'est produite : ${translate(e.code)}`, "");
    }
  }

  return (
    <DSFRContainer>
      <DidNotReceiveActivationCodeModal onRequestNewToken={handleRequestNewToken} />
      <ModifyEmailModal />
      <h1 className="text-2xl font-semibold text-[#161616]">Entrer le code d'activation</h1>
      <p className="mt-4 text-[#3A3A3A]">
        Pour valider la création de votre compte, vous devez entrer le code d’activation reçu sur la boîte mail <strong>{young?.email}</strong>
        <InlineButton
          onClick={() => {
            updateEmailModal.open();
          }}
          className="ml-1"
        />
      </p>
      <div className="mt-8 flex flex-col gap-1">
        <label>Code d'activation reçu par e-mail</label>
        <Input value={emailValidationToken} onChange={setEmailValidationToken} />
        {error && (
          <span className="text-sm text-red-500">
            {error}{" "}
            <InlineButton className="ml-1 text-sm text-red-500 hover:text-red-700" onClick={handleRequestNewToken}>
              Recevoir un nouveau code
            </InlineButton>
          </span>
        )}
      </div>
      <InlineButton
        className="mt-3"
        onClick={() => {
          emailValidationNoticeModal.open();
        }}>
        Je n'ai rien reçu
      </InlineButton>
      <SignupButtons onClickNext={handleClick} labelNext="Activer mon compte" />
    </DSFRContainer>
  );
}
