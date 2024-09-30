import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import React from "react";

type InformationsConvoyageProps = {
  disabled: boolean;
  informationsConvoyageData?: InformationsConvoyageData;
  handleChange: (newData: InformationsConvoyageData) => void;
};
export type InformationsConvoyageData = {
  editionOpenForReferentRegion?: boolean;
  editionOpenForReferentDepartment?: boolean;
  editionOpenForHeadOfCenter?: boolean;
};
export const InformationsConvoyage = ({ disabled, informationsConvoyageData, handleChange }: InformationsConvoyageProps) => {
  const handleDataChange = (data: Partial<InformationsConvoyageData>) => {
    handleChange({ ...informationsConvoyageData, ...data });
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-xs  font-medium text-gray-900">Remplissage des informations de convoyage</p>
        <MdInfoOutline data-tip data-for="remplissage_info_convoyage" className="h-5 w-5 cursor-pointer text-gray-400" />
        <ReactTooltip id="remplissage_info_convoyage" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
          <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
            Ouverture ou fermerture pour les utilisateurs de la possibilité de modifier les informations de convoyage.
          </p>
        </ReactTooltip>
      </div>
      <SimpleToggle
        label="Référents régionaux"
        disabled={disabled}
        value={!!informationsConvoyageData?.editionOpenForReferentRegion}
        onChange={(value: boolean) => handleDataChange({ editionOpenForReferentRegion: value })}
      />
      <SimpleToggle
        label="Référents départementaux"
        disabled={disabled}
        value={!!informationsConvoyageData?.editionOpenForReferentDepartment}
        onChange={(value: boolean) => handleDataChange({ editionOpenForReferentDepartment: value })}
      />
      <SimpleToggle
        label="Chef de centre"
        disabled={disabled}
        value={!!informationsConvoyageData?.editionOpenForHeadOfCenter}
        onChange={(value: boolean) => handleDataChange({ editionOpenForHeadOfCenter: value })}
      />
    </div>
  );
};
