import React, { useState, useEffect } from "react";
import { Switch, Link, NavLink, useHistory } from "react-router-dom";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useDocumentCss from "@/hooks/useDocumentCss";
import { SentryRoute } from "@/sentry";
import { toastr } from "react-redux-toastr";

// DSFR Requirements
import { fr } from "@codegouvfr/react-dsfr";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Page, Section, Container } from "@snu/ds/dsfr";
import LogoSNU from "@/assets/logo-snu.png";

import HumanCooperation from "@/assets/icons/HumanCooperation";
import Role from "./role";
import Email from "./email";
import Code from "./code";
import Informations from "./informations";
import Confirmation from "./confirmation";
import api from "@/services/api";
import { ROLES } from "snu-lib";
import Loader from "@/components/Loader";

export default function Index() {
  useDocumentTitle("Creer mon compte");
  useDocumentCss(["/dsfr/utility/icons/icons.min.css", "/dsfr/dsfr.min.css"]);
  startReactDsfr({ defaultColorScheme: "light", Link });

  const history = useHistory();

  const [onboardedUser, setOnboardedUser] = useState(null);

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
        if (ok && data) setOnboardedUser(data.referent);
        if (!ok) {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré");
        }
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré");
        }
      }
    })();
  }, []);

  const TAGLINE = {
    [ROLES.ADMINISTRATEUR_CLE]: "Compte administrateur CLE",
    [ROLES.REFERENT_CLASSE]: "Compte Responsable Classe engagée",
  };

  if (!onboardedUser) return <Loader />;

  return (
    <Page>
      <Header
        classes={{ root: "mb-8" }}
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
        serviceTagline={TAGLINE[onboardedUser.role] || ""}
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

      <Switch>
        <SentryRoute path="/creer-mon-compte" exact component={() => <Role />} />
        <SentryRoute path="/creer-mon-compte/email" component={() => <Email user={onboardedUser} />} />
        <SentryRoute path="/creer-mon-compte/code" component={() => <Code />} />
        <SentryRoute path="/creer-mon-compte/informations" component={() => <Informations />} />
        <SentryRoute path="/creer-mon-compte/confirmation" component={() => <Confirmation />} />
      </Switch>

      <Section>
        <Container className="!py-4 !px-8 flex items-center justify-between">
          <HumanCooperation />
          <div className="mx-4">
            <div className="text-xl font-bold text-[var(--text-title-grey)]">Besoin d’aide ?</div>
            <div className="text-[var(--light-text-action-high-grey)]">Consultez notre base de connaissance ou contactez notre équipe support</div>
          </div>
          <NavLink to="#" className="!bg-none">
            <i className={fr.cx("fr-icon-arrow-right-line", "w-[32px] h-[32px] text-[var(--background-action-high-blue-france)]")}></i>
          </NavLink>
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
