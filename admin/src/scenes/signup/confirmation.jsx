import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Page, Section, Container } from "@snu/ds/dsfr";
import LogoSNU from "@/assets/logo-snu.png";

export default function register() {
  const history = useHistory();

  const handleSubmit = () => {
    console.log("DONE");
  };

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
        <Stepper currentStep={5} stepCount={5} title="Création d’un compte : confirmation" />
        <Container className="flex flex-col gap-8">
          <h1 className="text-xl font-bold">Validez vos informations</h1>
          <hr className="p-1" />
          todo
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Valider</Button>
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
