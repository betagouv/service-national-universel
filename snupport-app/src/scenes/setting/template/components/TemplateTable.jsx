import React from "react";

import { Table, TH, THead, TBody, TR, TD } from "../../../../components/Table";
import ActionButton from "./ActionButton";

const MacroTable = ({ setTemplate, templates, disabled, onDelete, onDuplicate }) => {
  return (
    <Table>
      <THead>
        <TH className="w-[25%]" text="Modèle de ticket" />
        <TH className="w-[15%]" text="Créé par" />
        <TH className="w-[50%]" text="Description" />
        <TH className="flex w-[10%] justify-center" text="Actions" />
      </THead>

      <TBody>
        {templates.map((template) => {
          const { _id, name, description, createdBy } = template;
          return (
            <TR key={_id}>
              <TD className="w-[25%]">{name}</TD>
              <TD className="w-[15%]">{`${createdBy?.firstName}`}</TD>
              <TD className="w-[50%] break-words">{description}</TD>

              <TD className="flex w-[10%] justify-center">
                <ActionButton
                  actions={[
                    { label: "Éditer", onClick: () => setTemplate(template) },
                    { label: "Dupliquer", onClick: () => onDuplicate(template) },
                    { label: "Supprimer", onClick: () => onDelete(_id) },
                  ]}
                  disabled={disabled}
                />
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
};

export default MacroTable;
