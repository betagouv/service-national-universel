import React, { useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Page, Section, Container } from "@snu/ds/dsfr";
import LogoSNU from "@/assets/logo-snu.png";
import { PiQuestionFill } from "react-icons/pi";

export default function register() {
  const history = useHistory();
  const [role, setRole] = React.useState("chef_etablissement");
  const [etablissement, setEtablissement] = React.useState("chef_etablissement");

  const ROLES_CLE = {
    chef_etablissement: "Chef d'établissement",
    administrateur_cle: "Administrateur CLE",
    referent_cle: "Référent CLE",
    referent_snu: "Référent SNU",
  };

  const getEtablissement = async () => {
    const response = await api.get(`/etablissement/${etablissement_id}`);
    setEtablissement(response.data);
  };

  useEffect(() => {
    getEtablissement();
  }, []);

  // TODO : get dynamiquement le role et l'etablissement
  // ...?role=chef_etablissement&etablissement_id=abc123

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
        <Stepper currentStep={1} stepCount={5} title="Création d’un compte : rôle et fonction" nextTitle="Adresse email" />
        <Container className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Confirmez votre rôle et votre fonction</h1>
            <PiQuestionFill className="text-2xl text-[var(--background-action-high-blue-france)]" />
          </div>
          <hr className="p-1" />
          <p>
            Vous allez créez un compte Administrateur CLE en tant que <b>{ROLES_CLE[role]}</b> du <b>{etablissement?.name}</b>.
            <br />
            Confirmez-vous qu’il s’agit bien de votre rôle et de votre fonction ?
          </p>
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button onClick={() => history.push(`/creer-mon-compte/email`)}>Je confirme</Button>
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
