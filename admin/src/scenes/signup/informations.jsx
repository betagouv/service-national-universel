import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

import { InputPhone } from "@snu/ds/admin";
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
        <Stepper currentStep={4} stepCount={5} title="Création d’un compte : informations" nextTitle="Confirmation" />
        <Container className="flex flex-col gap-8">
          <h1 className="text-xl font-bold">Complétez ces informations</h1>
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
          <div className="flex w-full">
            <Select label="Numéro de téléphone" nativeSelectProps={{}}>
              <React.Fragment key=".0">
                <option disabled hidden selected value="">
                  Selectionnez une option
                </option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
              </React.Fragment>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-6">
              <div className="w-full">
                <PasswordInput label="Mot de passe" nativeInputProps={{}} />
              </div>
              <div className="w-full">
                <PasswordInput label="Confirmer votre mot de passe" nativeInputProps={{}} />
              </div>
            </div>
            <p className="text-neutral-600 text-sm">Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.</p>
          </div>
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button onClick={() => history.push(`/creer-mon-compte/confirmation`)}>Continuer</Button>
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
