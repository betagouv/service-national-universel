import React from "react";
import Header from "./Header";
import { Page, Footer } from "@snu/ds/dsfr";
import { addDsfrStylesheets } from "@/services/stylesheets.service";

export default function DSFRLayout({ children, title = "" }) {
  addDsfrStylesheets();

  return (
    <Page className="flex min-h-screen flex-col justify-between">
      <Header title={title} />
      <div className="mx-auto grid grid-cols-1 md:gap-8 md:my-8">{children}</div>
      <Footer />
    </Page>
  );
}
