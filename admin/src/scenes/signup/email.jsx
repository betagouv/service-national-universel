import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { Section, Container } from "@snu/ds/dsfr";
import api from "@/services/api";
import { translate } from "snu-lib";

export default function email({ user }) {
  const history = useHistory();
  const { search } = useLocation();

  const [email, setEmail] = useState(user.email);
  const [confirmEmail, setConfirmEmail] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { ok, data, code, message } = await api.put(`/cle/referent-signup/request-confirmation-email`, { email, confirmEmail, invitationToken });
      if (!ok) return toastr.error(message || translate(code));
      history.push(`/creer-mon-compte/code${search}`);
    } catch (error) {
      console.log(error);
      if (error?.message) return toastr.error(error?.message);
    }
  };

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={2} stepCount={5} title="Création d’un compte : adresse email" nextTitle="Code d'activation" />
      </div>
      <form onSubmit={submit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">Renseignez l'adresse email de votre établissement</h1>
            <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
          </div>
          <hr className="p-1" />
          <div className="flex gap-6">
            <div className="w-full">
              <Input
                label="Adresse email"
                state="default"
                stateRelatedMessage="Email invalide"
                nativeInputProps={{
                  placeholder: "exemple@mail.com",
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true,
                }}
              />
            </div>
            <div className="w-full">
              <Input
                label="Confirmez votre adresse email"
                state="default"
                stateRelatedMessage="Email invalide"
                nativeInputProps={{
                  placeholder: "exemple@mail.com",
                  type: "email",
                  value: confirmEmail,
                  onChange: (e) => setConfirmEmail(e.target.value),
                  required: true,
                }}
              />
            </div>
          </div>
          <div>
            <Alert description="Il doit s'agir d'une adresse email académique." severity="info" small />
          </div>
          <div>
            <Alert description="Nous allons vous envoyer un code pour activer votre adresse email renseignée ci-dessus." severity="info" small />
          </div>
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button type="submit">Continuer</Button>
          </div>
        </Container>
      </form>
    </Section>
  );
}
