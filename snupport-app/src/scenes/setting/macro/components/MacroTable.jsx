import React from "react";
import { HiCog } from "react-icons/hi";

import { Table, TH, THead, TBody, TR, TD } from "../../../../components/Table";

import { classNames } from "../../../../utils";

const MacroTable = ({ setMacro, macros }) => {
  return (
    <Table>
      <THead>
        <TH className="w-[20%]" text="Macro" />
        <TH className="w-[20%]" text="Dernière mise à jour" />
        <TH className="w-[44%]" text="Description" />
        <TH className="w-[16%]" text="Actif" />
      </THead>

      <TBody>
        {macros.map((macro) => {
          const { _id, name, description, isActive, updatedAt, updatedBy } = macro;
          return (
            <TR key={_id}>
              <TD className="w-[20%]">{name}</TD>
              <TD className="w-[20%]">
                {updatedBy && (
                  <>
                    {`${updatedBy?.firstName}`}
                    <br />
                    {`${Intl.DateTimeFormat("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(updatedAt))}`}
                  </>
                )}
              </TD>
              <TD className="w-[44%] break-words">{description}</TD>

              <TD className="flex w-[16%]">
                <div
                  className={classNames(
                    isActive ? "bg-[#D1FAE5] text-[#20735A]" : "border border-black/20 bg-white text-grey-text",
                    "mr-1 flex h-[30px] flex-1 items-center justify-center rounded-full px-3.5 text-xs font-medium"
                  )}
                >
                  {isActive ? "Actif" : "Inactif"}
                </div>

                <button type="button" className="text-xl text-gray-400 transition-colors hover:text-gray-500" onClick={() => setMacro(macro)}>
                  <HiCog />
                </button>
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
};

export default MacroTable;
