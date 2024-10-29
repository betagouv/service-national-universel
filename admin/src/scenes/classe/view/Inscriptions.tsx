import React, { useState } from "react";

import { Page, Container } from "@snu/ds/admin";

import ClasseHeader from "../header/ClasseHeader";

export default function Inscriptions(props) {
  const [classe, setClasse] = useState(props.classe);
  const studentStatus = props.studentStatus;
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Page>
      <ClasseHeader classe={classe} setClasse={setClasse} isLoading={isLoading} setIsLoading={setIsLoading} studentStatus={studentStatus} page={"Inscriptions"} />
      <Container></Container>
    </Page>
  );
}
