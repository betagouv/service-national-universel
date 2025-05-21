import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import { Controller } from "react-hook-form";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import React from "react";

type InformationsConvoyageProps = {
  disabled: boolean;
  control: any;
};

export const InformationsConvoyage = ({ disabled, control }: InformationsConvoyageProps) => {
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
      <Controller
        name="informationsConvoyage.editionOpenForReferentRegion"
        control={control}
        render={({ field }) => <SimpleToggle label="Référents régionaux" disabled={disabled} value={!!field.value} onChange={(value) => field.onChange(value)} />}
      />
      <Controller
        name="informationsConvoyage.editionOpenForReferentDepartment"
        control={control}
        render={({ field }) => <SimpleToggle label="Référents départementaux" disabled={disabled} value={!!field.value} onChange={(value) => field.onChange(value)} />}
      />
      <Controller
        name="informationsConvoyage.editionOpenForHeadOfCenter"
        control={control}
        render={({ field }) => <SimpleToggle label="Chef de centre" disabled={disabled} value={!!field.value} onChange={(value) => field.onChange(value)} />}
      />
    </div>
  );
};
