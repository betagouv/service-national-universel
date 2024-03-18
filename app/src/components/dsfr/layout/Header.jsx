import React from "react";
import SNU from "@/assets/logo-snu.png";
import useAuth from "../../../services/useAuth";
import { fr } from "@codegouvfr/react-dsfr";
import { Header as DSFRHeader } from "@codegouvfr/react-dsfr/Header";
import { supportURL } from "@/config";

const Header = ({ title }) => {
  const { isCLE, isLoggedIn, loginOrLogout } = useAuth();
  const isInscription = location.pathname.includes("inscription");

  const quickAccessItems = [
    isInscription && {
      linkProps: {
        href: "https://www.snu.gouv.fr/",
        target: "_blank",
      },
      text: "Programme",
      iconId: fr.cx("fr-icon-clipboard-line"),
    },
    !isInscription &&
      isLoggedIn && {
        linkProps: {
          href: "/",
        },
        text: isCLE ? "Mon compte élève" : "Mon compte volontaire",
        iconId: fr.cx("ri-account-box-line"),
      },
    {
      linkProps: {
        href: supportURL,
        target: "_blank",
      },
      iconId: fr.cx("fr-icon-question-line") || fr.cx("fr-icon-question-fill"),
      text: "Besoin d'aide",
    },
    {
      buttonProps: {
        onClick: () => loginOrLogout(),
        className: "border border-gray-500 py-1 px-2 hover:bg-gray-100",
      },
      text: isLoggedIn ? "Se déconnecter" : "Se connecter",
    },
  ];

  return (
    <DSFRHeader
      id="fr-header-header-with-quick-access-items"
      // className="lg:px-[5rem]"
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
