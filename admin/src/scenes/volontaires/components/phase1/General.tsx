import React, { useState } from "react";

import { Container } from "@snu/ds/admin";

import Phase1ConfirmationFormBlock from "./Phase1ConfirmationFormBlock";
import Phase1PresenceFormBlock from "./Phase1PresenceFormBlock";

export default function General({ young, setYoung, values, setValues, isCheckIsOpen, user }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerActionList = () => {
    return [];
  };

  return (
    <Container title="Informations générales" actions={containerActionList()}>
      <div className="flex justify-between">
        <Phase1ConfirmationFormBlock young={young} setYoung={setYoung} editing={editing} values={values} setValues={setValues} setLoading={setLoading} />
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <Phase1PresenceFormBlock
          young={young}
          setYoung={setYoung}
          editing={editing}
          values={values}
          setValues={setValues}
          setLoading={setLoading}
          isYoungCheckinOpen={isCheckIsOpen}
        />
      </div>
    </Container>
  );
}
