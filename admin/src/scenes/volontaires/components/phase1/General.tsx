import React from "react";

import { Container } from "@snu/ds/admin";

import Phase1ConfirmationFormBlock from "./Phase1ConfirmationFormBlock";
import Phase1PresenceFormBlock from "./Phase1PresenceFormBlock";

export default function General({ young, values }) {
  return (
    <Container title="Informations générales">
      <div className="flex justify-between">
        <Phase1ConfirmationFormBlock values={values} />
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <Phase1PresenceFormBlock young={young} values={values} />
      </div>
    </Container>
  );
}
