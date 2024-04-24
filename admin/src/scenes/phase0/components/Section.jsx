import React, { useState } from "react";

import Pencil from "@/assets/icons/Pencil";
import ChevronDown from "@/assets/icons/ChevronDown";

import { RoundButton } from "./Buttons";

export default function Section({ step, title, editable, collapsable, children, mode, onChangeMode, onSave, onCancel, saving = false, containerNoFlex = false }) {
  const [collapsed, setCollapsed] = useState(false);

  function startEdit() {
    // history.push(`/volontaire/${young._id}/edit`);
    onChangeMode && onChangeMode("edition");
  }

  function stopEdit() {
    onChangeMode && onChangeMode("default");
    onCancel && onCancel();
  }

  return (
    <div className="relative mb-[24px] rounded-[8px] bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <h2 className={`border-[1px] border-[#E5E7EB] py-[28px] text-[18px] font-medium leading-snug ${mode === "edition" ? "pl-[28px] text-left" : "text-center"}`}>
        {step && <span className="text-[#6B7280]">{step} </span>}
        <span className="text-[#242526]">{title}</span>
      </h2>
      {editable && !saving && (
        <>
          {mode === "edition" ? (
            <div className="absolute top-[24px] right-[24px] flex items-center">
              <RoundButton onClick={stopEdit} mode="grey">
                Annuler
              </RoundButton>
              <RoundButton className="ml-[8px]" onClick={onSave}>
                <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                Enregistrer les changements
              </RoundButton>
            </div>
          ) : (
            <RoundButton className="absolute top-[24px] right-[24px]" onClick={startEdit}>
              <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
              Modifier
            </RoundButton>
          )}
        </>
      )}
      {saving && <div className="absolute top-[30px] right-[24px] text-[14px] text-[#6B7280]">Enregistrement en cours...</div>}
      {collapsable && (
        <div
          className="absolute top-[24px] right-[24px] flex h-[40px] w-[40px] cursor-pointer items-center justify-center text-[#9CA3AF] hover:text-[#242526]"
          onClick={() => setCollapsed(!collapsed)}>
          <ChevronDown className={collapsed ? "" : "rotate-180"} />
        </div>
      )}
      <div className={`p-[32px] ${collapsed ? "hidden" : containerNoFlex ? "block" : "flex"}`}>{children}</div>
    </div>
  );
}
