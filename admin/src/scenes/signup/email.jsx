import React from "react";
import { useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { Section, Container } from "@snu/ds/dsfr";

export default function email() {
  const history = useHistory();

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={2} stepCount={5} title="Création d’un compte : adresse email" nextTitle="Code d'activation" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Renseignez l'adresse email de votre etablissement</h1>
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
          <Button onClick={() => history.push(`/creer-mon-compte/code`)}>Continuer</Button>
        </div>
      </Container>
    </Section>
  );
}
