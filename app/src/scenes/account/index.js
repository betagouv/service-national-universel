import React from "react";
import { Switch, useLocation } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import AccountGeneralPage from "./scenes/general";
import PageTitle from "./components/PageTitle";
import MobileMenu from "./components/MobileMenu";
import useDevice from "../../hooks/useDevice";
import AccountPasswordPage from "./scenes/password";
import ChevronLeft from "../../assets/icons/ChevronLeft";
import BackLink from "./components/BackLink";
import AccountRepresentantsPage from "./scenes/representants";
import AccountSchoolSituationPage from "./scenes/school-situation";
import AccountSpecialSituationsPage from "./scenes/special-situations";

const ACCOUNT_PAGES = {
  general: {
    title: "Information générales",
    path: "/account/general",
  },
  password: {
    title: "Mot de passe",
    path: "/account/password",
  },
  representants: {
    title: "Représentants légaux",
    path: "/account/representants",
  },
  "school-situation": {
    title: "Situation scolaire",
    path: "/account/school-situation",
  },
  "special-situations": {
    title: "Situations particulières",
    path: "/account/special-situations",
  },
};

const Account = () => {
  const device = useDevice();
  const { pathname } = useLocation();
  const [, pagePath] = pathname.split("/").filter((path) => path);

  return (
    <>
      <div className="p-4">
        {device === "mobile" && pagePath && (
          <BackLink to="/account" className="mb-2">
            <ChevronLeft />
            Retour à mon profil
          </BackLink>
        )}
        <PageTitle className={pagePath ? "mb-6" : "mb-8"}>{ACCOUNT_PAGES[pagePath]?.title || "Mon profil"}</PageTitle>
        {device === "mobile" && !pagePath && (
          <MobileMenu>
            {Object.values(ACCOUNT_PAGES).map(({ title, path }) => (
              <MobileMenu.ItemLink key={path} to={path}>
                {title}
              </MobileMenu.ItemLink>
            ))}
          </MobileMenu>
        )}
      </div>
      <Switch>
        <SentryRoute path="/account/general" component={AccountGeneralPage} />
        <SentryRoute path="/account/password" component={AccountPasswordPage} />
        <SentryRoute path="/account/representants" component={AccountRepresentantsPage} />
        <SentryRoute path="/account/school-situation" component={AccountSchoolSituationPage} />
        <SentryRoute path="/account/special-situations" component={AccountSpecialSituationsPage} />
      </Switch>
    </>
  );
};

export default Account;
