import React from "react";
import { Page, Header, Container } from "@snu/ds/admin";
import ClasseIcon from "@/components/drawer/icons/Classe";

export default function view() {
  return (
    <Page>
      <Header title="Mes classes" breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes" }]} />
      <Container title="bla bla bla" />
    </Page>
  );
}
