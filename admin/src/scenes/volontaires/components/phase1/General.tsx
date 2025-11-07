import React, { useState } from "react";
import { HiOutlinePencil } from "react-icons/hi";

import { Container, Button } from "@snu/ds/admin";
import { ROLES } from "snu-lib";

import Phase1ConfirmationFormBlock from "./Phase1ConfirmationFormBlock";

export default function General({ young, setYoung, values, setValues, isCheckIsOpen, user }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const canEdit = ![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role);
  const containerActionList = (editing, setEditing, canEdit) => {
    if (editing) {
      return [
        <div key="actions" className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={() => setEditing(false)} disabled={loading} />
        </div>,
      ];
    } else if (canEdit) {
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEditing(true)} disabled={loading} />];
    } else {
      return [];
    }
  };

  return (
    <Container title="Informations générales" actions={containerActionList(editing, setEditing, canEdit)}>
      <div className="flex justify-between">
        <Phase1ConfirmationFormBlock young={young} setYoung={setYoung} editing={editing} values={values} setValues={setValues} setLoading={setLoading} />
      </div>
    </Container>
  );
}
