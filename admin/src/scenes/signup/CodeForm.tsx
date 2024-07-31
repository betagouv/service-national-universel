import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { translate, ReferentDto } from "snu-lib";
import { Section, Container } from "@snu/ds/dsfr";

import { User } from "@/types";
import api from "@/services/api";

import Stepper from "./components/Stepper";

interface Props {
  referent: ReferentDto;
  reinscription: boolean;
  invitationToken: string;
  onReferentChange: (referent: User) => void;
}

export default function CodeForm({ referent, reinscription, invitationToken, onReferentChange }: Props) {
  const history = useHistory();
  const { search } = useLocation();

  const urlParams = new URLSearchParams(search);
  const codeUrl = urlParams.get("code");

  const [code, setCode] = useState(codeUrl || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/cle/referent-signup/confirm-email`, { code, invitationToken });
      if (!response.ok) return toastr.error(response.message || translate(response.code), "");
      onReferentChange(response.data);
      history.push(`/creer-mon-compte/${reinscription ? "confirmation" : "informations"}${search}`);
    } catch (error) {
      console.log(error);
      if (error?.message) return toastr.error(error?.message, "");
    }
  };

  return (
    <Section>
      {!reinscription && <Stepper currentStep={3} stepCount={5} title="Création d’un compte : code d'activation" nextTitle="Informations" />}
      <form onSubmit={handleSubmit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">Renseignez votre code d'activation</h1>
          </div>
          <hr className="p-1" />
          <div>
            <Alert
              description={
                <div>
                  Pour valider la création de votre compte administrateur SNU, vous devez entrer le code d'activation reçu à l'adresse email{" "}
                  <b>{referent.emailWaitingValidation}</b>.
                </div>
              }
              severity="info"
              small
            />
          </div>
          <div className="w-full">
            <Input
              label="Code"
              state="default"
              nativeInputProps={{
                placeholder: "000000",
                type: "text",
                value: code,
                onChange: (e) => setCode(e.target.value),
                required: true,
              }}
            />
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
          <div className="flex justify-end gap-2">
            <Button type="button" priority="secondary" onClick={() => history.goBack()}>
              Précédent
            </Button>
            <Button disabled={!code} type="submit">
              Continuer
            </Button>
          </div>
        </Container>
      </form>
    </Section>
  );
}
