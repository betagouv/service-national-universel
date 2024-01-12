import React, { useEffect, useState } from "react";
import AsyncCombobox from "@/components/dsfr/forms/AsyncCombobox";
import Input from "./Input";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import { RiArrowGoBackLine } from "react-icons/ri";
import { getAddressOptions } from "@/services/api-adresse";
import { getCities, getSchools } from "../utils";
import { toastr } from "react-redux-toastr";
import Select from "@/components/dsfr/forms/SearchableSelect";

export default function SchoolInFrance({ school, onSelectSchool, errors, corrections = null }) {
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState(getInitialSchoolValue());
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [manualFilling, setManualFilling] = useState(school?.fullName && !school?.id);
  const [manualSchool, setManualSchool] = useState(school ?? {});

  function getInitialSchoolValue() {
    if (school?.city && school?.departmentName) {
      return { label: school.city + " - " + school.departmentName, value: [school.city, school.departmentName] };
    }
    return null;
  }

  async function fetchSchools(city) {
    try {
      setLoading(true);
      const schools = await getSchools(city);
      setSchoolOptions(schools);
    } catch (e) {
      toastr.error("Erreur", "Une erreur est survenue lors de la recherche", { timeOut: 10_000 });
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeCity(city) {
    if (!city) {
      setCity(null);
      return;
    }
    onSelectSchool(undefined);
    setCity(city);
    if (!city?.value.length === 2) return;
    await fetchSchools(city);
  }

  useEffect(() => {
    if (city?.value[0] && city?.value[1] && !loading && !schoolOptions.length) {
      fetchSchools(city);
    }
  }, [city, loading, schoolOptions]);

  function formatSchoolName(school) {
    if (!school?.fullName) return "";
    if (!school?.adresse) return school.fullName;
    return school.fullName + " - " + school.adresse;
  }
  const manualEntryOption = {
    value: "MANUAL_ENTRY",
    label: <strong>Je ne pas trouve mon établissement</strong>,
  };
  const eee = "Je ne pas trouve mon établissement";

  return manualFilling ? (
    <>
      <hr></hr>
      <div className="flex items-center py-4">
        <RiArrowGoBackLine className="font-bold mt-1 mr-2 text-[#000091]" />
        <button
          className="text-[#000091] cursor-pointer"
          onClick={() => {
            setManualFilling(false);
            onSelectSchool(null);
            // setManualSchool(school);
            // setCity(null);
          }}>
          Revenir à la liste des établissements
        </button>
      </div>
      <Input
        value={manualSchool.fullName}
        label="Saisir le nom de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, fullName: value });
          onSelectSchool(null);
        }}
        error={errors?.manualFullName}
        correction={corrections?.schoolName}
      />
      <AddressForm
        data={manualSchool}
        updateData={(newData) => {
          setManualSchool({ ...manualSchool, ...newData });
          onSelectSchool({ ...newData, fullName: manualSchool.fullName });
        }}
        getOptions={getAddressOptions}
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
        hint="Aucune commune trouvée."
        getOptions={getCities}
        value={city}
        onChange={handleChangeCity}
        error={errors.city}
      />
      <Select
        label="Nom de l'établissement"
        value={formatSchoolName(school)}
        placeholder="Sélectionnez un établissement"
        options={[
          ...schoolOptions
            .map((e) => ({
              value: `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`,
              label: `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
          manualEntryOption,
        ]}
        manualEntryOption={eee}
        onChange={(value) => {
          if (value === manualEntryOption.value) {
            setManualFilling(true);
            onSelectSchool(null);
          } else {
            onSelectSchool(schoolOptions.find((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}` === value));
          }
        }}
        error={errors?.school}
        correction={corrections?.schoolName}
      />
    </>
  );
}
