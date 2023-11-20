import React, { useCallback, useEffect, useState } from "react";
import Combobox from "@/components/dsfr/forms/Combobox";
import CreatableSelect from "../../../components/CreatableSelect";
import Input from "./Input";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import GhostButton from "../../../components/dsfr/ui/buttons/GhostButton";
import { FiChevronLeft } from "react-icons/fi";
import { getAddressOptions } from "@/services/api-adresse";
import { getCities, getSchools } from "../utils";
import { debounce } from "@/utils";
import { toastr } from "react-redux-toastr";

export default function SchoolInFrance({ school, onSelectSchool, errors, corrections = null }) {
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState(school ? { label: school.city + " - " + school.departmentName, value: [school.city, school.departmentName] } : null);
  const [cityOptions, setCityOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [manualFilling, setManualFilling] = useState(school?.fullName && !school?.id);
  const [manualSchool, setManualSchool] = useState(school ?? {});

  async function handleChangeCity(city) {
    if (!city) {
      setCity(null);
      return;
    }
    onSelectSchool(undefined);
    setCity(city);
    if (!city?.value.length === 2) return;
    const schools = await getSchools(city);
    setSchoolOptions(schools);
  }

  const debouncedOptions = useCallback(
    debounce(async (query) => {
      try {
        setLoading(true);
        const options = await getCities(query);
        if (options?.length) {
          setCityOptions(options);
        }
      } catch (e) {
        toastr.error("Erreur", "Une erreur est survenue lors de la recherche", { timeOut: 10_000 });
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  const handleChangeQuery = async (query) => {
    setCityOptions([]);
    if (query.length > 1) {
      debouncedOptions(query);
    }
  };

  useEffect(() => {
    async function fetchSchools() {
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
    if (city?.value.length === 2 && !loading && !schoolOptions.length) {
      fetchSchools();
    }
  }, [city, loading, schoolOptions]);

  return manualFilling ? (
    <>
      <Input
        value={manualSchool.fullName}
        label="Nom de l'établissement"
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
        error={errors?.school}
        correction={corrections?.schoolAddress}
      />
      <GhostButton
        name={
          <div className="flex items-center justify-center gap-1 text-center">
            <FiChevronLeft className="font-bold text-[#000091]" />
            Revenir à la liste des établissements
          </div>
        }
        onClick={() => {
          setManualFilling(false);
        }}
      />
    </>
  ) : (
    <>
      <Combobox
        label="Rechercher une commune"
        value={city}
        onChange={handleChangeCity}
        options={cityOptions}
        onChangeQuery={handleChangeQuery}
        loading={loading}
        hint="Aucune commune trouvée."
        error={errors.city}
      />
      <CreatableSelect
        label="Nom de l'établissement"
        value={school?.fullName && `${school.fullName} - ${school.adresse}`}
        options={schoolOptions
          .map((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`)
          .sort()
          .map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          onSelectSchool(schoolOptions.find((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}` === value));
        }}
        placeholder="Sélectionnez un établissement"
        onCreateOption={(value) => {
          setManualSchool({ fullName: value });
          onSelectSchool(null);
          setManualFilling(true);
        }}
        error={errors?.school}
        correction={corrections?.schoolName}
      />
    </>
  );
}
