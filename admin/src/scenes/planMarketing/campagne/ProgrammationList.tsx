import React from "react";
import { HiOutlinePlusSm } from "react-icons/hi";
import ProgrammationForm, { ProgrammationProps } from "./ProgrammationForm";
import { Button, Switcher } from "@snu/ds/admin";
import { TypeEvenement } from "snu-lib";
import { CampagneDataProps } from "./CampagneForm";

type ProgrammationListProps = {
  campagne: CampagneDataProps;
  onChange: (value: ProgrammationProps[] | { isProgrammationActive: boolean }) => void;
  isCampagneGenerique?: boolean;
};

export default function ProgrammationList({ campagne, onChange, isCampagneGenerique = false }: ProgrammationListProps) {
  const handleDelete = (index: number) => {
    const newProgrammations = [...campagne.programmations];
    newProgrammations.splice(index, campagne.programmations.length - index);
    onChange(newProgrammations);
  };

  const handleAdd = () => {
    const newProgrammation: ProgrammationProps = {
      joursDecalage: 0,
      type: TypeEvenement.AUCUN,
    };
    onChange([...campagne.programmations, newProgrammation]);
  };

  const handleChange = (index: number, data: Partial<ProgrammationProps>) => {
    const newProgrammations = [...campagne.programmations];
    newProgrammations[index] = { ...newProgrammations[index], ...data };
    onChange(newProgrammations);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Programmation</h3>
        <div className="flex items-center gap-2">
          <Switcher
            label={campagne.isProgrammationActive ? "Active" : "Inactive"}
            value={campagne.isProgrammationActive}
            onChange={(value) => onChange({ isProgrammationActive: value })}
            disabled={campagne.isArchived}
          />
          <Button type="icon" leftIcon={<HiOutlinePlusSm size={20} />} onClick={handleAdd} disabled={campagne.isArchived || !campagne.isProgrammationActive} />
        </div>
      </div>
      <div className="space-y-4">
        {campagne.programmations.map((prog, index) => {
          return (
            <ProgrammationForm
              key={index}
              programmation={{
                ...prog,
                label: index === 0 ? "Premier envoi" : `Relance n°${index}`,
              }}
              isEnabled={campagne.isProgrammationActive && !prog.sentAt}
              isCampagneGenerique={isCampagneGenerique}
              isRemovable={!prog.sentAt && campagne.isProgrammationActive}
              onDelete={() => handleDelete(index)}
              onChange={(data) => handleChange(index, data)}
            />
          );
        })}
      </div>
    </div>
  );
}
