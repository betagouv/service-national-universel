import React from "react";
import { useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Section, Container } from "@snu/ds/dsfr";

export default function register() {
  const history = useHistory();

  const handleSubmit = () => {
    console.log("DONE");
  };

  return (
    <Section>
      <Stepper currentStep={5} stepCount={5} title="Création d’un compte : confirmation" />
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold">Validez vos informations</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        <div>
          <div className="flex items-start justify-between">
            <h2 className="text-lg">Mon profil</h2>
            <i className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer")} onClick={() => history.goBack()}></i>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Établissement scolaire :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">Lycée Professionnel Marie Laurencin</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Rôle :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">Administrateur CLE</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Fonction :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">Coordinateur d’établissement</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Prénom :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">Maxime</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Nom :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">PISTACHE</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Numéro de téléphone :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">(+33) 06 07 08 09 01</div>
          </div>
        </div>
        <div>
          <div className="flex items-start justify-between">
            <h2 className="text-lg">Mon compte</h2>
            <i className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer")} onClick={() => history.goBack()}></i>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[var(--light-text-mention-grey)]">Adresse email :</div>
            <div className="text-right text-[var(--light-text-label-grey)]">maxime.pistache@ac-paris.fr</div>
          </div>
        </div>
        <hr className="p-1" />
        <Checkbox
          options={[
            {
              label: (
                <p className="p-0 m-0 !pl-8">
                  J'ai lu et j'accepte les <a href="#">Conditions Générales d'Utilisation (CGU)</a> de la plateforme du Service National Universel.
                </p>
              ),
              nativeInputProps: {
                name: "checkboxes-1",
                value: "value1",
              },
            },
            {
              label: (
                <p className="p-0 m-0 !pl-8">
                  J’ai pris connaissance des <a href="#">modalités de traitement de mes données personnelles</a>.
                </p>
              ),
              nativeInputProps: {
                name: "checkboxes-1",
                value: "value2",
              },
            },
          ]}
          small
        />
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Valider</Button>
        </div>
      </Container>
    </Section>
  );
}
