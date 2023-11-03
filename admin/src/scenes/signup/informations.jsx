import React from "react";
import { useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

import { InputPhone } from "@snu/ds/admin";
import { Section, Container } from "@snu/ds/dsfr";

export default function register() {
  const history = useHistory();

  return (
    <Section>
      <Stepper currentStep={4} stepCount={5} title="Création d’un compte : informations" nextTitle="Confirmation" />
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold">Complétez ces informations</h1>
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
        <div className="flex w-full">
          <Select label="Numéro de téléphone" nativeSelectProps={{}}>
            <React.Fragment key=".0">
              <option disabled hidden selected value="">
                Selectionnez une option
              </option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
              <option value="4">Option 4</option>
            </React.Fragment>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-6">
            <div className="w-full">
              <PasswordInput label="Mot de passe" nativeInputProps={{}} />
            </div>
            <div className="w-full">
              <PasswordInput label="Confirmer votre mot de passe" nativeInputProps={{}} />
            </div>
          </div>
          <p className="text-neutral-600 text-sm">Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.</p>
        </div>
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={() => history.push(`/creer-mon-compte/confirmation`)}>Continuer</Button>
        </div>
      </Container>
    </Section>
  );
}
