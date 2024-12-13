import React from "react";
import SNU from "@/assets/logo-snu.png";
import useAuth from "../../../services/useAuth";
import { fr } from "@codegouvfr/react-dsfr";
import { Header as DSFRHeader } from "@codegouvfr/react-dsfr/Header";
import { appURL, knowledgebaseURL } from "@/config";

const Header = ({ title }) => {
  const { isCLE, isLoggedIn, loginOrLogout } = useAuth();
  const isInscription = location.pathname.includes("inscription");

  const quickAccessItems = [
    {
      linkProps: {
        href: knowledgebaseURL,
        target: "_blank",
      },
      iconId: fr.cx("fr-icon-question-line") || fr.cx("fr-icon-question-fill"),
      text: "Besoin d'aide",
    },
    {
      buttonProps: {
        onClick: () => loginOrLogout(),
        className: "border border-gray-500  hover:bg-gray-100",
      },
      text: isLoggedIn ? "Se déconnecter" : "Se connecter",
    },
  ];

  if (isInscription) {
    quickAccessItems.push({
      linkProps: {
        href: "https://www.snu.gouv.fr/",
        target: "_blank",
      },
      text: "Programme",
      iconId: fr.cx("fr-icon-clipboard-line"),
    });
  }

  if (!isInscription && isLoggedIn) {
    quickAccessItems.push({
      linkProps: {
        href: appURL,
      },
      text: isCLE ? "Mon compte élève" : "Mon compte volontaire",
      iconId: fr.cx("ri-account-box-line"),
    });
  }

  return (
    <DSFRHeader
      id="fr-header-header-with-quick-access-items"
      brandTop={
        <>
          RÉPUBLIQUE
          <br />
          FRANÇAISE
        </>
      }
      homeLinkProps={{
        to: "/",
        title: "Acceuil - Service National Universel",
      }}
      operatorLogo={{
        alt: "Logo Service National Universel",
        imgUrl: `${SNU}`,
        orientation: "vertical",
      }}
      serviceTitle="Service National Universel"
      serviceTagline={title}
      quickAccessItems={quickAccessItems}
    />
  );
};

export default Header;
