import React, { useState, useEffect } from "react";
import { Switch, Link, NavLink, useHistory, Redirect, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

// DSFR Requirements
import { fr } from "@codegouvfr/react-dsfr";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Page, Section, Container } from "@snu/ds/dsfr";

import { ROLES } from "snu-lib";
import { EtablissementDto } from "snu-lib/src/dto/etablissementDto";

import { ReferentDto } from "snu-lib/src/dto";
import { SentryRoute } from "@/sentry";
import api from "@/services/api";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useDocumentCss from "@/hooks/useDocumentCss";
import LogoSNU from "@/assets/logo-snu.png";
import HumanCooperation from "@/assets/icons/HumanCooperation";
import Loader from "@/components/Loader";

import Role from "./RoleForm";
import Email from "./EmailForm";
import Code from "./CodeForm";
import Informations from "./InformationsForm";
import Confirmation from "./ConfirmationForm";

export default function Index() {
  useDocumentTitle("Creer mon compte");
  useDocumentCss(["/dsfr/utility/icons/icons.min.css", "/dsfr/dsfr.min.css"]);
  startReactDsfr({ defaultColorScheme: "light", Link: Link as any });

  const history = useHistory();
  const { search } = useLocation();

  const [referent, setReferent] = useState<ReferentDto | null>(null);
  const [etablissement, setEtablissement] = useState<EtablissementDto & { fullName?: string; postcode?: string }>();
  const [reinscription, setReinscription] = useState(false);

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
        if (!ok) {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré", "");
        } else if (data) {
          setReinscription(!!data.reinscription);
          setReferent(data.referent);
          setEtablissement(data.etablissement);
        }
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré", "");
        }
      }
    })();
  }, []);

  const TAGLINE = {
    [ROLES.ADMINISTRATEUR_CLE]: "Compte administrateur CLE",
    [ROLES.REFERENT_CLASSE]: "Compte Responsable Classe engagée",
  };

  if (!invitationToken || !referent) return <Loader />;

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
          href: "/creer-mon-compte",
          title: "Accueil - Nom de l’entité (ministère, secrétariat d’état, gouvernement)",
        }}
        serviceTitle="Service National Universel"
        serviceTagline={TAGLINE[referent.role] || ""}
        quickAccessItems={[
          {
            iconId: "fr-icon-todo-fill",
            text: "Programme",
            linkProps: {
              href: "#",
            },
          },
          {
            iconId: "fr-icon-question-fill",
            text: "Besoin d'aide",
            linkProps: {
              href: "#",
            },
          },
          {
            iconId: "fr-icon-account-fill",
            text: "Se connecter",
            linkProps: {
              href: "#",
              property: "primary",
            },
          },
        ]}
      />

      <Switch>
        <SentryRoute path="/creer-mon-compte" exact component={() => <Role referent={referent} etablissement={etablissement} reinscription={reinscription} />} />
        <SentryRoute path="/creer-mon-compte/email" component={() => <Email referent={referent} reinscription={reinscription} invitationToken={invitationToken} />} />
        <SentryRoute
          path="/creer-mon-compte/code"
          component={() => <Code referent={referent} reinscription={reinscription} invitationToken={invitationToken} onReferentChange={setReferent} />}
        />
        <SentryRoute
          path="/creer-mon-compte/informations"
          component={() => <Informations referent={referent} reinscription={reinscription} invitationToken={invitationToken} onReferentChange={setReferent} />}
        />
        <SentryRoute path="/verifier-mon-compte" component={() => <Redirect to={`/creer-mon-compte/confirmation${search ? `${search}&reinscription=1` : search}`} />} />
        <SentryRoute
          path="/creer-mon-compte/confirmation"
          component={() => <Confirmation referent={referent} etablissement={etablissement} reinscription={reinscription} invitationToken={invitationToken} />}
        />
      </Switch>

      <Section>
        <Container className="!py-4 !px-8 flex items-center justify-between">
          <HumanCooperation />
          <div className="mx-4">
            <div className="text-xl font-bold text-[var(--text-title-grey)]">Besoin d’aide ?</div>
            <div className="text-[var(--light-text-action-high-grey)]">Consultez notre base de connaissance ou contactez notre équipe support</div>
          </div>
          <NavLink to="#" className="!bg-none">
            <i className={fr.cx("fr-icon-arrow-right-line", "w-[32px] h-[32px] text-[var(--background-action-high-blue-france)]" as any)}></i>
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
