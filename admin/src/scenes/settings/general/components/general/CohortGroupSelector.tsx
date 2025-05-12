import React from "react";
import CreatableSelect from "react-select/creatable";
import useCreateCohortGroup from "../../hooks/useCreateCohortGroup";
import useCohortGroups from "../../hooks/useCohortGroups";
import { CohortDto } from "snu-lib";

type propType = {
  group: string;
  cohort: CohortDto;
  onChange: (value) => void;
  readOnly: boolean;
};

type optionType = { value: string; label: string };

export default function CohortGroupSelector({ group, cohort, onChange, readOnly }: propType) {
  const { isLoading, data } = useCohortGroups();
  const options: optionType[] = data?.map((group) => ({ value: group._id, label: group.name })) || [];
  const { mutate } = useCreateCohortGroup(cohort);

  const handleChange = (selected: optionType) => {
    if (selected) {
      onChange(selected.value);
    }
  };

  const handleCreate = async (name: string) => {
    if (!window.confirm(`Voulez-vous créer le groupe de cohorte ${name} ?`)) return;
    mutate(name, {
      onSuccess: (data) => onChange(data._id),
    });
  };

  return (
    <CreatableSelect
      options={options}
      value={options?.find((o) => o.value === group) || null}
      isDisabled={isLoading || readOnly}
      onChange={handleChange}
      formatCreateLabel={(input) => `Créer le groupe "${input}"`}
      onCreateOption={handleCreate}
      placeholder="Sélectionnez un groupe de cohorte"
      styles={{
        control: (base) => ({
          ...base,
          padding: "10px",
          minHeight: "40px",
        }),
      }}
    />
  );
}
