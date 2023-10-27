import React from "react";
import { Page, Header, Container } from "@snu/ds/admin";
import StudentIcon from "@/components/drawer/icons/Student";

export default function view() {
  return (
    <Page>
      <Header title="Mes élèves" breadcrumb={[{ title: <StudentIcon className="scale-[65%]" /> }, { title: "Mes élèves" }]} />
      <Container title="bla bla bla" />
    </Page>
  );
}
