import React, { useMemo } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { Select, InputText, Button } from "@snu/ds/admin";
import { TypeEvenement, TypeRegleEnvoi, TYPE_EVENEMENT_LABELS, EVENEMENT_TYPE_MAP, REGLE_ENVOI_CONFIG } from "snu-lib";

export type ProgrammationProps = {
  id: string;
  label: string;
  typeEvenement: TypeEvenement;
  typeRegleEnvoi: TypeRegleEnvoi;
  dateEnvoi?: string;
  joursDecalage?: number;
  onDelete?: () => void;
  onChange?: (data: Partial<ProgrammationProps>) => void;
  isCampagneGenerique?: boolean;
  isEnabled?: boolean;
};

type DelaiOption = {
  value: number;
  label: string;
};

export default function ProgrammationForm({
  id,
  label,
  typeEvenement,
  typeRegleEnvoi,
  dateEnvoi,
  joursDecalage = 0,
  isEnabled = true,
  onDelete,
  onChange,
  isCampagneGenerique = false,
}: ProgrammationProps) {
  const handleChange = (field: string, value: any) => {
    if (field === "typeEvenement") {
      const eventType = value as TypeEvenement;
      const newRegleEnvoi = EVENEMENT_TYPE_MAP[eventType];

      onChange?.({
        [field]: value,
        typeRegleEnvoi: newRegleEnvoi,
        joursDecalage: 0,
      });
    } else {
      onChange?.({ [field]: value });
    }
  };

  const typeEvenementOptions = useMemo(() => {
    return Object.entries(TYPE_EVENEMENT_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }, []);

  const config = REGLE_ENVOI_CONFIG[typeRegleEnvoi];

  const getDelaiOptions = (min: number, max: number): DelaiOption[] => {
    const options: DelaiOption[] = [];
    for (let i = min; i <= max; i++) {
      options.push({
        value: i,
        label: i === 0 ? "J+0" : i > 0 ? `J+${i}` : `J${i}`,
      });
    }
    return options;
  };

  const delaiOptions = useMemo(() => {
    if (typeRegleEnvoi === TypeRegleEnvoi.PERSONNALISE) return [];
    const min = config.joursMin ?? 0;
    const max = config.joursMax ?? 0;
    return getDelaiOptions(min, max);
  }, [typeRegleEnvoi, config.joursMin, config.joursMax]);

  const selectedDelaiOption = useMemo(() => {
    return delaiOptions.find((option) => option.value === joursDecalage);
  }, [delaiOptions, joursDecalage]);

  return (
    <>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Select
            value={selectedDelaiOption}
            onChange={(option) => option && handleChange("joursDecalage", option.value)}
            options={delaiOptions}
            placeholder="Sélectionner un délai"
            className="w-full"
            closeMenuOnSelect
            disabled={!isEnabled}
          />
        </div>
        <div className="flex-1">
          <Select
            value={typeEvenementOptions.find((option) => option.value === typeEvenement)}
            onChange={(option) => handleChange("typeEvenement", option.value)}
            options={typeEvenementOptions}
            placeholder="Type d'événement"
            className="w-full"
            closeMenuOnSelect
            disabled={!isEnabled}
          />
        </div>

        {!isCampagneGenerique && (
          <div className="flex-1">
            <InputText
              name="dateEnvoi"
              value={dateEnvoi || ""}
              onChange={(e) => handleChange("dateEnvoi", e.target.value)}
              type="datetime-local"
              className="w-full"
              placeholder="Date d'envoi"
              disabled={!isEnabled}
            />
          </div>
        )}
        <Button type="icon" leftIcon={<HiOutlineTrash size={20} className="text-red-500" />} onClick={onDelete} />
      </div>
    </>
  );
}
