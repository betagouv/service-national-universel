import React from "react";
import { useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Section, Container } from "@snu/ds/dsfr";

export default function confirmation() {
  const history = useHistory();

  const handleSubmit = () => {
    console.log("DONE");
    history.push("/auth");
  };

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={5} stepCount={5} title="Création d’un compte : confirmation" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Validez vos informations</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        <div>
          <div className="flex items-start justify-between">
            <h2 className="text-lg">Mon profil</h2>
            <i className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer")} onClick={() => history.goBack()}></i>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Établissement scolaire :</div>
            <div className="text-right text-[#161616]">Lycée Professionnel Marie Laurencin</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Rôle :</div>
            <div className="text-right text-[#161616]">Administrateur CLE</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Fonction :</div>
            <div className="text-right text-[#161616]">Coordinateur d’établissement</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Prénom :</div>
            <div className="text-right text-[#161616]">Maxime</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Nom :</div>
            <div className="text-right text-[#161616]">PISTACHE</div>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Numéro de téléphone :</div>
            <div className="text-right text-[#161616]">(+33) 06 07 08 09 01</div>
          </div>
        </div>
        <div>
          <div className="flex items-start justify-between">
            <h2 className="text-lg">Mon compte</h2>
            <i className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer")} onClick={() => history.goBack()}></i>
          </div>
          <div className="flex items-start justify-between">
            <div className="text-[#666]">Adresse email :</div>
            <div className="text-right text-[#161616]">maxime.pistache@ac-paris.fr</div>
          </div>
        </div>
        <hr className="p-1" />
        <Checkbox
          options={[
            {
              label: (
                <p className="p-0 m-0 mt-2 !pl-8 text-xs">
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
                <p className="p-0 m-0 mt-3 !pl-8 text-xs">
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
