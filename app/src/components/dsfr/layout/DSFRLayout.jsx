import React from "react";
import Header from "./Header";
import { Page, Footer } from "@snu/ds/dsfr";
import { addDsfrStylesheets } from "@/services/stylesheets.service";

export default function DSFRLayout({ children, title = "" }) {
  addDsfrStylesheets();

  return (
    <Page className="flex min-h-screen flex-col justify-between">
      <Header title={title} />
      {children}
      <Footer />
    </Page>
  );
}
