import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Section, Container } from "@snu/ds/dsfr";
import { ROLES, SUB_ROLES, translate } from "snu-lib";

export default function role({ user }) {
  const history = useHistory();
  const { search } = useLocation();

  const [etablissement, setEtablissement] = React.useState();

  const getEtablissement = () => {
    //todo : recuperer l'etablissement via l'id du user
    setEtablissement("ABC");
  };

  useEffect(() => {
    if (!user) return;
    getEtablissement();
  }, [user]);

  const displayText = () => {
    if (!user) return "";
    if (user.role === ROLES.ADMINISTRATEUR_CLE && user.subRole === SUB_ROLES.referent_etablissement) {
      return (
        <span>
          Vous allez créez un compte Administrateur CLE en tant que <b>{translate(user.role)}</b>.
        </span>
      );
    }
    if (!etablissement) return "";
    return (
      <span>
        Vous allez créez un compte Administrateur CLE en tant que <b>{translate(user.role)}</b> du <b>{etablissement}</b>.
      </span>
    );
  };

  if (!user || !etablissement) return <div>Chargement...</div>;

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={1} stepCount={5} title="Création d’un compte : rôle et fonction" nextTitle="Adresse email" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold">Confirmez votre rôle et votre fonction</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        <p>
          {displayText()}
          <br />
          Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
        </p>
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={() => history.push(`/creer-mon-compte/email${search}`)}>Je confirme</Button>
        </div>
      </Container>
    </Section>
  );
}
