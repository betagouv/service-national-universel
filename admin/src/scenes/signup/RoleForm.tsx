import React from "react";
import { useHistory, useLocation } from "react-router-dom";

import { Button } from "@codegouvfr/react-dsfr/Button";

import { translate, isChefEtablissement, isCoordinateurEtablissement, isAdminCle } from "snu-lib";
import { EtablissementDto } from "snu-lib/src/dto/etablissementDto";
import { Section, Container } from "@snu/ds/dsfr";

import Stepper from "./components/Stepper";
import { User } from "@/types";

interface Props {
  user: User;
  etablissement?: EtablissementDto & { fullName?: string; postcode?: string };
  reinscription: boolean;
}

export default function RoleForm({ user, etablissement, reinscription }: Props) {
  const history = useHistory();
  const { search } = useLocation();

  return (
    <Section>
      {!reinscription && <Stepper currentStep={1} stepCount={5} title="Création d’un compte : rôle et fonction" nextTitle="Adresse email" />}
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Confirmez votre rôle et votre fonction</h1>
        </div>
        <hr className="p-1" />
        {isChefEtablissement(user) && (
          <p>
            <span>
              Vous allez créez un compte {translate(user.role)} en tant que <b>{translate(user.subRole)}</b>.
            </span>
            <br />
            Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
          </p>
        )}
        {isCoordinateurEtablissement(user) && (
          <p>
            <span>
              Vous allez créez un compte {translate(user.role)} en tant que <b>{translate(user.subRole)}</b> du <b>{etablissement?.name}</b>.
            </span>
            <br />
            Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
          </p>
        )}
        {!isAdminCle(user) && (
          <p>
            <span>
              Vous allez créez un compte SNU en tant que <b>{translate(user.role)}</b> du <b>{etablissement?.name}</b>.
            </span>
            <br />
            Confirmez-vous qu’il s’agit bien de votre rôle ?
          </p>
        )}
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={() => history.push(`/creer-mon-compte/email${search}`)}>Je confirme</Button>
        </div>
      </Container>
    </Section>
  );
}
