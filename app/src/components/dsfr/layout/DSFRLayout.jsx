import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Page } from "@snu/ds/dsfr";

export default function DSFRLayout({ children, title = "" }) {
  return (
    <Page>
      <Header title={title} />
      {children}
      <Footer />
    </Page>
  );
}
