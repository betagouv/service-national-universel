import React from "react";
import { Page, Header, Container } from "@snu/ds/admin";
import InstitutionIcon from "@/components/drawer/icons/Institution";

export default function view() {
  return (
    <Page>
      <Header title="Mon établissement" breadcrumb={[{ title: <InstitutionIcon className="scale-[65%]" /> }, { title: "Mon établissement" }]} />
      <Container title="bla bla bla" />
    </Page>
  );
}
