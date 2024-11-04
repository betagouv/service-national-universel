import React from "react";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import { RenderManualInscriptionTogglesProps } from "./getManualInscriptionTogglesByCohortType";

export const renderManualInscriptionCLEToggles = ({ cohort, handleToggleChange, isLoading, readOnly, toggles }: RenderManualInscriptionTogglesProps) => {
  return (
    <>
      {toggles.map((toggle) => {
        const toggleValue = (cohort[toggle.field] as boolean) ?? false;
        return <SimpleToggle key={toggle.field} label={toggle.label} value={toggleValue} disabled={isLoading || readOnly} onChange={() => handleToggleChange(toggle.field)} />;
      })}
    </>
  );
};
