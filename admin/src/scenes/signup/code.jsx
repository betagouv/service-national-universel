import React from "react";
import { useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { Section, Container } from "@snu/ds/dsfr";

export default function code() {
  const history = useHistory();
  const [email, setEmail] = React.useState("blabla@email.com");

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={3} stepCount={5} title="Création d’un compte : code d'activation" nextTitle="Informations" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Renseignez votre code d'activation</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        <div>
          <Alert
            description={
              <div>
                Pour valider la création de votre compte administrateur SNU, vous devez entrer le code d'activation reçu à l'adresse email <b>{email}</b>.
              </div>
            }
            severity="info"
            small
          />
        </div>
        <div className="w-full">
          <Input label="Code" state="default" />
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">Si vous ne recevez pas de mail, veuillez vérifier que :</p>
          <ul>
            <li>L'adresse email que vous utilisez est bien celle indiquée ci-dessus</li>
            <li>Le mail ne se trouve pas dans vos spams</li>
            <li>
              L'adresse email <i>no_reply-mailauto@snu.gouv.fr</i> ne fait pas partie des adresses indésirables de votre boite mail
            </li>
            <li>Votre boite de réception n'est pas saturée</li>
          </ul>
        </div>
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={() => history.push(`/creer-mon-compte/informations`)}>Continuer</Button>
        </div>
      </Container>
    </Section>
  );
}
