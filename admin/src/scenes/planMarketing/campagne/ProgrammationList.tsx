import React from "react";
import { HiOutlinePlusSm } from "react-icons/hi";
import ProgrammationForm, { ProgrammationProps } from "./ProgrammationForm";
import { Button, Switcher } from "@snu/ds/admin";
import { TypeEvenement, TypeRegleEnvoi } from "snu-lib";
import { CampagneDataProps } from "./CampagneForm";
import { useToggle } from "react-use";

type ProgrammationListProps = {
  campagne: CampagneDataProps;
  programmations: ProgrammationProps[];
  onChange: (programmations: ProgrammationProps[]) => void;
  isCampagneGenerique?: boolean;
};

export default function ProgrammationList({ campagne, programmations, onChange, isCampagneGenerique = false }: ProgrammationListProps) {
  const [isProgrammationActive, setIsProgrammationActive] = useToggle(false);

  const handleDelete = (id: string) => {
    const newProgrammations = programmations.filter((prog) => prog.id !== id);
    onChange(newProgrammations);
  };

  const handleAdd = () => {
    const newProgrammation: ProgrammationProps = {
      id: Math.random().toString(36).substr(2, 9),
      label: "",
      typeEvenement: TypeEvenement.AUCUN,
      typeRegleEnvoi: TypeRegleEnvoi.DATE,
      joursDecalage: 0,
    };
    onChange([...programmations, newProgrammation]);
  };

  const handleChange = (id: string, data: Partial<ProgrammationProps>) => {
    const newProgrammations = programmations.map((prog) => (prog.id === id ? { ...prog, ...data } : prog));
    onChange(newProgrammations);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Programmation</h3>
        <div className="flex items-center gap-2">
          <Switcher label={isProgrammationActive ? "Active" : "Inactive"} value={isProgrammationActive} onChange={setIsProgrammationActive} />
          <Button type="icon" leftIcon={<HiOutlinePlusSm size={20} />} onClick={handleAdd} />
        </div>
      </div>
      <div className="space-y-4">
        {programmations.map((prog, index) => (
          <ProgrammationForm
            isEnabled={isProgrammationActive}
            key={prog.id}
            {...prog}
            label={index === 0 ? "Premier envoi" : `Relance n°${index}`}
            isCampagneGenerique={isCampagneGenerique}
            onDelete={() => handleDelete(prog.id)}
            onChange={(data) => handleChange(prog.id, data)}
          />
        ))}
      </div>
    </div>
  );
}
