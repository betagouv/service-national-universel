import React, { useEffect } from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import AccountGeneralPage from "./scenes/general";
import PageTitle from "./components/PageTitle";
import MobileMenu from "../../components/nav/MobileMenu";
import useDevice from "../../hooks/useDevice";
import AccountPasswordPage from "./scenes/password";
import ChevronLeft from "../../assets/icons/ChevronLeft";
import BackLink from "./components/BackLink";
import AccountRepresentantsPage from "./scenes/representants";
import AccountSchoolSituationPage from "./scenes/school-situation";
import AccountSpecialSituationsPage from "./scenes/special-situations";
import AccountWithdrawnPage from "./scenes/withdrawn";
import Tabs from "../../components/nav/Tabs";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useAuth from "@/services/useAuth";

const Account = () => {
  useDocumentTitle("Mon profil");
  const { isCLE } = useAuth();

  const ACCOUNT_PAGES = {
    general: {
      title: "Informations générales",
      key: "/account/general",
    },
    password: {
      title: "Mot de passe",
      key: "/account/password",
    },
    representants: {
      title: "Représentants légaux",
      key: "/account/representants",
    },
    "school-situation": {
      title: isCLE ? "Classe engagée" : "Situation scolaire",
      key: "/account/school-situation",
    },
    "special-situations": {
      title: "Situations particulières",
      key: "/account/special-situations",
    },
    "withdranw": {
      title: "Se désister",
      key: "/account/withdrawn",
    },
  };
  const device = useDevice();
  const { pathname } = useLocation();
  const [, pagePath] = pathname.split("/").filter((path) => path);

  const history = useHistory();

  const handleChangeTab = (path) => {
    history.push(path);
  };

  useEffect(() => {
    if (device === "desktop" && !pagePath) {
      history.push("/account/general");
    }
  }, [pagePath]);

  return (
    <>
      <div className="p-[16px] lg:p-8">
        {device === "mobile" && pagePath && (
          <BackLink to="/account" className="mb-2">
            <ChevronLeft />
            Retour à mon profil
          </BackLink>
        )}
        <PageTitle className={pagePath ? "mb-6" : "mb-8 lg:mb-6"}>{(device === "mobile" && pagePath && ACCOUNT_PAGES[pagePath]?.title) || "Mon profil"}</PageTitle>
        {device === "mobile" && !pagePath && (
          <MobileMenu>
            {Object.values(ACCOUNT_PAGES).map(({ title, key }) => (
              <MobileMenu.ItemLink key={key} to={key}>
                {title}
              </MobileMenu.ItemLink>
            ))}
          </MobileMenu>
        )}
        {device === "desktop" && (
          <div>
            <Tabs onChange={handleChangeTab} tabs={Object.values(ACCOUNT_PAGES)} selectedTabKey={`/account/${pagePath || "general"}`} />
          </div>
        )}
      </div>

      <div className="p-0 lg:!p-8 lg:!pt-0">
        <Switch>
          <SentryRoute path="/account/general" component={AccountGeneralPage} />
          <SentryRoute path="/account/password" component={AccountPasswordPage} />
          <SentryRoute path="/account/representants" component={AccountRepresentantsPage} />
          <SentryRoute path="/account/school-situation" component={AccountSchoolSituationPage} />
          <SentryRoute path="/account/special-situations" component={AccountSpecialSituationsPage} />
          <SentryRoute path="/account/withdrawn" component={AccountWithdrawnPage} />
        </Switch>
      </div>
    </>
  );
};

export default Account;
