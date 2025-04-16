import React, { useState } from "react";
import AsyncCombobox from "@/components/dsfr/forms/AsyncCombobox";
import { Input } from "@snu/ds/dsfr";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import { RiArrowGoBackLine } from "react-icons/ri";
import { City, getCities, getSchools, School } from "../utils";
import Select from "@/components/dsfr/forms/SearchableSelect";
import { useQuery } from "@tanstack/react-query";

import { Select as SelectNext } from "@codegouvfr/react-dsfr/SelectNext";

type Correction = {
  schoolName?: string;
  schoolAddress?: string;
};

type Props = {
  school: School;
  onSelectSchool: (school?: School) => void;
  errors?: any;
  corrections?: Correction;
};

export default function SchoolInFrance({ school, onSelectSchool, errors, corrections }: Props) {
  console.log("🚀 ~ SchoolInFrance ~ school:", school);
  const [city, setCity] = useState<City>();
  const { data: schools } = useQuery({
    queryFn: () => getSchools(city!.name, city!.departmentName),
    queryKey: ["schools", city?.name, city?.departmentName],
    enabled: !!city,
  });
  const schoolOptions = schools?.map((e) => ({ value: e.id, label: formatSchoolName(e) })) ?? [];
  const [manualFilling, setManualFilling] = useState(school?.fullName && !school?.id && school?.country === "FRANCE");
  const [manualSchool, setManualSchool] = useState<School | undefined>(school ?? {});

  function handleChangeCity(city?: { label: string; value: City }) {
    if (city) setCity(city.value);
    onSelectSchool(undefined);
  }

  function formatSchoolName(school) {
    if (!school?.fullName) return "";
    if (!school?.adresse) return school.fullName;
    return school.fullName + " - " + school.adresse;
  }

  return manualFilling ? (
    <>
      <hr></hr>
      <div className="flex items-center">
        <RiArrowGoBackLine className="font-bold mt-1 mr-2 text-[#000091]" />
        <button
          className="text-[#000091] cursor-pointer"
          onClick={() => {
            setManualFilling(false);
            onSelectSchool(undefined);
          }}>
          Revenir à la liste des établissements
        </button>
      </div>
      <Input
        label="Saisir le nom de l'établissement"
        nativeInputProps={{
          value: manualSchool?.fullName,
          placeholder: "Ex. Lycée général Carnot, Collège Georges Brassens...",
          onChange: (e) => {
            setManualSchool({ ...manualSchool, fullName: e.target.value });
            onSelectSchool({ ...school, fullName: e.target.value, country: "FRANCE" });
          },
        }}
        stateRelatedMessage={errors?.manualFullName || corrections?.schoolName}
        state={errors?.manualFullName || (corrections?.schoolName && "error")}
      />
      <AddressForm
        data={manualSchool}
        updateData={(newData) => {
          setManualSchool({ ...manualSchool, ...newData });
          onSelectSchool({ ...newData, fullName: manualSchool?.fullName, country: "FRANCE" });
        }}
        label="Rechercher l'adresse de l'établissement"
        error={errors?.school}
        correction={corrections?.schoolAddress}
      />
    </>
  ) : (
    <>
      <hr></hr>
      <AsyncCombobox
        label="Rechercher la commune de l'établissement"
        placeholder="Ex. Lille, La Rochelle, Paris 13e..."
        hint="Aucune commune trouvée."
        getOptions={getCities}
        value={city}
        onChange={handleChangeCity}
        errorMessage={errors.city}
      />
      <Select
        label="Nom de l'établissement"
        value={school?.id}
        placeholder="Sélectionnez un établissement"
        options={schoolOptions.sort((a, b) => a.label.localeCompare(b.label))}
        onChange={(value: string) => {
          const selectedSchool = schoolOptions.find((option) => option.value === value);
          onSelectSchool(selectedSchool);
        }}
        error={errors?.school}
        correction={corrections?.schoolName}
      />
      {/* <SelectNext
        label="Nom de l'établissement"
        placeholder="Sélectionnez un établissement"
        nativeSelectProps={{
          value: school?.id,
          onChange: (e) => onSelectSchool(schoolOptions.find((option) => option.id === e.target.value)),
        }}
        options={schoolOptions
          .map((e) => ({
            value: e.id ?? "",
            label: `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))}
        state={errors?.school ? "error" : undefined}
        stateRelatedMessage={errors?.school || corrections?.schoolName}
      /> */}
      <button
        className="text-sm text-gray-500 underline underline-offset-2"
        onClick={() => {
          setManualFilling(true);
          setManualSchool(undefined);
          onSelectSchool(undefined);
        }}>
        Je n'ai pas trouvé mon établissement
      </button>
    </>
  );
}
