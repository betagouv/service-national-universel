import React, { useState } from "react";
import validator from "validator";
import { updateEmailModal } from "./Modals";
import Input from "@/components/dsfr/forms/input";
import API from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { capture } from "@/sentry";

const ModifyEmailModal = () => {
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const trimmedEmail = email?.trim();
  const trimmedEmailConfirmation = emailConfirmation?.trim();

  const validate = () => {
    let errors = {};
    if (!email) {
      errors.email = "Ce champ est obligatoire";
    }
    if (!emailConfirmation) {
      errors.emailConfirmation = "Ce champ est obligatoire";
    }
    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      errors.email = "L'e-mail renseigné est invalide";
    }
    if (trimmedEmail && trimmedEmailConfirmation && trimmedEmail !== trimmedEmailConfirmation) {
      errors.emailConfirmation = "Les emails ne correspondent pas";
    }
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length) {
      setError(errors);
      return;
    }
    setError({});

    setLoading(true);
    try {
      const { code, ok, user } = await API.post("/young/signup/email", { email });
      if (!ok) {
        toastr.error(`Une erreur s'est produite", ${translate(code)}`);
        return;
      }
      dispatch(setYoung(user));
      toastr.success("Votre adresse mail a bien été mise à jour et un code d'activation vous a été envoyé à cette adresse", "", { timeOut: 6000 });
    } catch (e) {
      capture(e);
      toastr.error(`Une erreur s'est produite", ${translate(e.code)}`);
    }
    setLoading(false);

    updateEmailModal.close();
  };

  return (
    <updateEmailModal.Component
      title="Modifier mon adresse e-mail"
      iconId="fr-icon-arrow-right-line"
      buttons={[
        {
          children: "Annuler",
        },
        {
          doClosesModal: false,
          onClick: handleSubmit,
          children: "Recevoir le code d’activation",
          disabled: loading,
        },
      ]}>
      <Input label="Email" value={email} onChange={setEmail} state={error?.email ? "error" : "default"} stateRelatedMessage={error?.email} />
      <Input
        label="Confirmez votre e-mail"
        state={error?.emailConfirmation ? "error" : "default"}
        stateRelatedMessage={error?.emailConfirmation}
        value={emailConfirmation}
        onChange={setEmailConfirmation}
      />
    </updateEmailModal.Component>
  );
};

export default ModifyEmailModal;
