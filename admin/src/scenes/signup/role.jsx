import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Section, Container } from "@snu/ds/dsfr";
import { ROLES, SUB_ROLES, translate } from "snu-lib";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";

export default function role() {
  const history = useHistory();
  const { search } = useLocation();

  const [user, setUser] = React.useState();
  const [etablissement, setEtablissement] = React.useState();

  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  useEffect(() => {
    (async () => {
      try {
        if (!invitationToken) {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré");
        }
        const { data, ok } = await api.get(`/cle/referent-signup/token/${invitationToken}`);
        if (ok && data) {
          setUser(data.referent);
          setEtablissement(data.etablissement);
        }
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré");
        }
      }
    })();
  }, []);

  const displayText = () => {
    if (!user) return "";
    if (user.role === ROLES.ADMINISTRATEUR_CLE && user.subRole === SUB_ROLES.referent_etablissement) {
      return (
        <p>
          <span>
            Vous allez créez un compte {translate(user.role)} en tant que <b>{translate(user.subRole)}</b>.
          </span>
          <br />
          Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
        </p>
      );
    }
    if (user.role === ROLES.ADMINISTRATEUR_CLE && user.subRole === SUB_ROLES.coordinateur_cle) {
      return (
        <p>
          <span>
            Vous allez créez un compte {translate(user.role)} en tant que <b>{translate(user.subRole)}</b> du <b>{etablissement?.name}</b>.
          </span>
          <br />
          Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
        </p>
      );
    }
    return (
      <p>
        <span>
          Vous allez créez un compte SNU en tant que <b>{translate(user.role)}</b> du <b>{etablissement?.name}</b>.
        </span>
        <br />
        Confirmez-vous qu’il s’agit bien de votre rôle ?
      </p>
    );
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={1} stepCount={5} title="Création d’un compte : rôle et fonction" nextTitle="Adresse email" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Confirmez votre rôle et votre fonction</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        {displayText()}
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={() => history.push(`/creer-mon-compte/email${search}`)}>Je confirme</Button>
        </div>
      </Container>
    </Section>
  );
}
