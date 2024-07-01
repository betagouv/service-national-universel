import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";

import { ROLES, SUB_ROLES, translate } from "snu-lib";
import { EtablissementDto } from "snu-lib/src/dto/etablissementDto";
import { Section, Container } from "@snu/ds/dsfr";

import api from "@/services/api";
import { User } from "@/types";
import Loader from "@/components/Loader";

import Stepper from "./components/Stepper";

export default function RoleForm() {
  const history = useHistory();
  const { search } = useLocation();

  const [user, setUser] = React.useState<User>();
  const [etablissement, setEtablissement] = React.useState<EtablissementDto>();

  const urlParams = new URLSearchParams(search);
  const invitationToken = urlParams.get("token");

  useEffect(() => {
    (async () => {
      try {
        if (!invitationToken) {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré", "");
        }
        const { data, ok } = await api.get(`/cle/referent-signup/token/${invitationToken}`);
        if (ok && data) {
          setUser(data.referent);
          setEtablissement(data.etablissement);
        }
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré", "");
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Loader />;

  return (
    <Section>
      <Stepper currentStep={1} stepCount={5} title="Création d’un compte : rôle et fonction" nextTitle="Adresse email" />
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Confirmez votre rôle et votre fonction</h1>
        </div>
        <hr className="p-1" />
        {user?.role === ROLES.ADMINISTRATEUR_CLE && user?.subRole === SUB_ROLES.referent_etablissement && (
          <p>
            <span>
              Vous allez créez un compte {translate(user.role)} en tant que <b>{translate(user.subRole)}</b>.
            </span>
            <br />
            Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
          </p>
        )}
        {user?.role === ROLES.ADMINISTRATEUR_CLE && user?.subRole === SUB_ROLES.coordinateur_cle && (
          <p>
            <span>
              Vous allez créez un compte {translate(user.role)} en tant que <b>{translate(user.subRole)}</b> du <b>{etablissement?.name}</b>.
            </span>
            <br />
            Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
          </p>
        )}
        {user?.role && user.role !== ROLES.ADMINISTRATEUR_CLE && (
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
