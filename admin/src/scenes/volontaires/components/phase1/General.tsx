import React from "react";
import { HiOutlinePencil } from "react-icons/hi";

import { Container, Button, Label, InputText, Select } from "@snu/ds/admin";
import { ROLES } from "snu-lib";

import Phase1ConfirmationFormBlock from "./Phase1ConfirmationFormBlock";
import Phase1PresenceFormBlock from "./Phase1PresenceFormBlock";

export default function General({ young, setYoung, editing, setEditing, values, setValues, loading, setLoading, isCheckIsOpen, user }) {
  const canEdit = ![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role);
  const containerActionList = (edit, setEdit, canEdit) => {
    if (edit) {
      return [
        <div key="actions" className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={setEdit(false)} disabled={loading} />
        </div>,
      ];
    } else if (canEdit) {
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={loading} />];
    } else {
      return [];
    }
  };

  return (
    <Container title="Informations générales" actions={containerActionList(editing, setEditing, canEdit)}>
      <div className="grid grid-cols-2">
        <Phase1ConfirmationFormBlock
          className="col-start-1 border-r-[1px] border-gray-200 pr-11"
          young={young}
          setYoung={setYoung}
          editing={editing}
          values={values}
          setValues={setValues}
          setLoading={setLoading}
        />
        <Phase1PresenceFormBlock
          className="col-start-2 pl-11"
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
