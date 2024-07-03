import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { fr } from "@codegouvfr/react-dsfr";
import Stepper from "./components/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { patternEmailAcademy, translate } from "snu-lib";
import { Section, Container } from "@snu/ds/dsfr";

import api from "@/services/api";

export default function EmailForm({ user }) {
  const history = useHistory();
  const { search } = useLocation();

  const [email, setEmail] = useState(user.email);
  const [confirmEmail, setConfirmEmail] = useState("");

  const urlParams = new URLSearchParams(search);
  const invitationToken = urlParams.get("token");
  const reinscription = urlParams.get("reinscription");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { ok, code, message } = await api.put(`/cle/referent-signup/request-confirmation-email`, { email, confirmEmail, invitationToken });
      if (!ok) return toastr.error(message || translate(code), "");
      history.push(`/creer-mon-compte/code${search}`);
    } catch (error) {
      console.log(error);
      if (error?.message) return toastr.error(error?.message, "");
    }
  };

  return (
    <Section>
      {!reinscription && <Stepper currentStep={2} stepCount={5} title="Création d’un compte : adresse email" nextTitle="Code d'activation" />}
      <form onSubmit={handleSubmit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">Renseignez l'adresse email de votre établissement</h1>
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
                  pattern: patternEmailAcademy,
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
                  pattern: patternEmailAcademy,
                  onChange: (e) => setConfirmEmail(e.target.value),
                  required: true,
                }}
              />
            </div>
          </div>
          <div>
            <Alert description="Nous allons vous envoyer un code pour activer votre adresse email renseignée ci-dessus." severity="info" small />
          </div>
          <hr className="p-1" />
          <div className="flex justify-end gap-2">
            <Button type="button" priority="secondary" onClick={() => history.goBack()}>
              Précédent
            </Button>
            <Button type="submit">Continuer</Button>
          </div>
        </Container>
      </form>
    </Section>
  );
}
