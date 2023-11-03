import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { Page, Section, Container } from "@snu/ds/dsfr";
import LogoSNU from "@/assets/logo-snu.png";

export default function register() {
  const history = useHistory();

  return (
    <Page>
      <Header
        brandTop={
          <>
            RÉPUBLIQUE
            <br />
            FRANÇAISE
          </>
        }
        operatorLogo={{
          alt: "Logo Service National Universel",
          imgUrl: LogoSNU,
          orientation: "vertical",
        }}
        homeLinkProps={{
          to: "/creer-mon-compte",
          title: "Accueil - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)",
        }}
        serviceTitle="Service National Universel"
        serviceTagline="Compte Responsable Classe engagée"
        quickAccessItems={[
          {
            iconId: fr.cx("fr-icon-todo-fill"),
            text: "Programme",
            linkProps: {
              to: "#",
            },
          },
          {
            iconId: fr.cx("fr-icon-question-fill"),
            text: "Besoin d'aide",
            linkProps: {
              to: "#",
            },
          },
          {
            iconId: fr.cx("fr-icon-account-fill"),
            text: "Se connecter",
            linkProps: {
              to: "#",
              property: "primary",
            },
          },
        ]}
      />
      <Section>
        <Stepper currentStep={2} stepCount={5} title="Création d’un compte : adresse email" nextTitle="Code d'activation" />
        <Container className="flex flex-col gap-8">
          <h1 className="text-xl font-bold">Renseignez l'adresse email de votre etablissement</h1>
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
          <div>
            <Alert description="Il doit s'agir d'une adresse email académique." severity="info" small />
          </div>
          <div>
            <Alert description="Nous allons vous envoyer un code pour activer votre adresse email renseignée ci-dessus." severity="info" small />
          </div>
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button onClick={() => history.push(`/creer-mon-compte/code`)}>Continuer</Button>
          </div>
        </Container>
      </Section>

      <Footer
        classes={{ root: "mt-[60px] pb-4 bg-[var(--background-default-grey)]", bottomList: "flex items-center justify-start" }}
        accessibility="non compliant"
        bottomItems={[
          <NavLink key="sitemap" to="#" className="text-xs bg-none hover:bg-inherit" style={{ color: "var(--text-mention-grey)" }}>
            Plan du site
          </NavLink>,
          <NavLink key="sitemap" to="#" className="text-xs bg-none hover:bg-inherit" style={{ color: "var(--text-mention-grey)" }}>
            Mentions légales
          </NavLink>,
          <NavLink key="sitemap" to="#" className="text-xs bg-none hover:bg-inherit" style={{ color: "var(--text-mention-grey)" }}>
            Données personnelles
          </NavLink>,
          <NavLink key="sitemap" to="#" className="text-xs bg-none hover:bg-inherit" style={{ color: "var(--text-mention-grey)" }}>
            Gestion des cookies
          </NavLink>,
        ]}
        contentDescription="Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des liens forts et se découvrir un talent pour l’engagement !"
        operatorLogo={{
          alt: "Logo Service National Universel",
          imgUrl: LogoSNU,
          orientation: "vertical",
        }}
      />
    </Page>
  );
}
