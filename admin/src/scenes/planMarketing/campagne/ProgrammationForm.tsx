import React, { useMemo } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { Select, InputText, Button } from "@snu/ds/admin";
import { TypeEvenement, TypeRegleEnvoi, TYPE_EVENEMENT_LABELS, REGLE_ENVOI_CONFIG, formatDateForInput } from "snu-lib";

export type ProgrammationProps = {
  joursDecalage: number;
  type: TypeEvenement;
  createdAt?: Date;
  envoiDate?: Date;
  label?: string;
  sentAt?: Date;
};

type ProgrammationFormProps = {
  programmation: ProgrammationProps;
  onDelete?: () => void;
  onChange?: (data: Partial<ProgrammationProps>) => void;
  isCampagneGenerique?: boolean;
  isEnabled?: boolean;
  isRemovable?: boolean;
};

type DelaiOption = {
  value: number;
  label: string;
};

export default function ProgrammationForm({ programmation, isEnabled = true, onDelete, onChange, isCampagneGenerique = false, isRemovable }: ProgrammationFormProps) {
  const handleChange = (field: keyof ProgrammationProps, value: any) => {
    if (field === "type" && value === TypeEvenement.AUCUN) {
      onChange?.({ [field]: value, joursDecalage: 0, envoiDate: undefined });
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

  const config = REGLE_ENVOI_CONFIG[TypeRegleEnvoi.DATE];

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
    const min = config.joursMin ?? 0;
    const max = config.joursMax ?? 0;
    return getDelaiOptions(min, max);
  }, [config.joursMin, config.joursMax]);

  const selectedDelaiOption = useMemo(() => {
    return delaiOptions.find((option) => option.value === programmation.joursDecalage);
  }, [delaiOptions, programmation.joursDecalage]);

  const isDelaiOptionDisabled = useMemo(() => {
    return programmation.type === TypeEvenement.AUCUN;
  }, [programmation.type]);

  const isEnvoiDateDisabled = useMemo(() => {
    return programmation.type !== TypeEvenement.AUCUN;
  }, [programmation.type]);

  return (
    <>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900">{programmation.label}</span>
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
            disabled={!isEnabled || isDelaiOptionDisabled}
          />
        </div>
        <div className="flex-1">
          <Select
            value={typeEvenementOptions.find((option) => option.value === programmation.type)}
            onChange={(option) => handleChange("type", option.value)}
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
              name="envoiDate"
              value={formatDateForInput(programmation.envoiDate)}
              onChange={(e) => handleChange("envoiDate", new Date(e.target.value))}
              type="datetime-local"
              className="w-full"
              placeholder="Date d'envoi"
              disabled={!isEnabled || isEnvoiDateDisabled}
            />
          </div>
        )}
        <Button disabled={!isRemovable} type="icon" leftIcon={<HiOutlineTrash size={20} className={`text-red-500 ${!isRemovable ? "opacity-50" : ""}`} />} onClick={onDelete} />
      </div>
    </>
  );
}
