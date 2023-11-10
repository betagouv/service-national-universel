import React from "react";
import { useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

import { InputPhone } from "@snu/ds/dsfr";

import { Section, Container } from "@snu/ds/dsfr";

export default function informations() {
  const [etablissement, setEtablissement] = React.useState("");
  const history = useHistory();

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={4} stepCount={5} title="Création d’un compte : informations" nextTitle="Confirmation" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Complétez ces informations</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        <div className="flex gap-6">
          <div className="w-full">
            <Input
              label="Prénom"
              state="default"
              stateRelatedMessage="Email invalide"
              nativeInputProps={{
                placeholder: "Jean",
              }}
            />
          </div>
          <div className="w-full">
            <Input
              label="Nom"
              state="default"
              stateRelatedMessage="Email invalide"
              nativeInputProps={{
                placeholder: "Michel",
              }}
            />
          </div>
        </div>
        <div className="w-full">
          <Select
            label="Établissement scolaire"
            nativeSelectProps={{
              onChange: (event) => setEtablissement(event.target.value),
              value: etablissement,
            }}>
            <option value="" disabled hidden>
              Selectionnez une option
            </option>
            <option value="1">Etablissement 1</option>
            <option value="2">Etablissement 2</option>
            <option value="3">Etablissement 3</option>
            <option value="4">Etablissement 4</option>
          </Select>
        </div>
        <div className="flex w-full">
          <InputPhone label="Numéro de téléphone" />
        </div>
        <div className="w-full">
          <PasswordInput label="Mot de passe" nativeInputProps={{}} />
        </div>
        <div className="w-full">
          <PasswordInput label="Confirmer votre mot de passe" nativeInputProps={{}} />
        </div>
        <p className="text-neutral-600 text-sm">Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.</p>
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={() => history.push(`/creer-mon-compte/confirmation`)}>Continuer</Button>
        </div>
      </Container>
    </Section>
  );
}
