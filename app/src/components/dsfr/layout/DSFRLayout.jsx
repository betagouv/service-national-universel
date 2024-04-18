import React from "react";
import Header from "./Header";
import { Page, Footer } from "@snu/ds/dsfr";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { shouldDisplayMaintenanceNotice } from "@/utils";

export default function DSFRLayout({ children, title = "" }) {
  return (
    <Page className="flex min-h-screen flex-col justify-between">
      <Header title={title} />
      {shouldDisplayMaintenanceNotice && (
        <Notice title="Maintenance planifiée jeudi 18 avril de 20h à minuit : vous ne serez pas en mesure d'accéder aux plateformes pendant cette période." />
      )}
      {children}
      <Footer />
    </Page>
  );
}
