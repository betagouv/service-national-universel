import React, { useState } from "react";
import api from "../../../services/api";
import CreatableSelect from "../../../components/CreatableSelect";
import Input from "./Input";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import GhostButton from "../../../components/dsfr/ui/buttons/GhostButton";
import { FiChevronLeft } from "react-icons/fi";
import { getAddressOptions } from "@/services/api-adresse";
import AsyncCombobox from "@/components/dsfr/forms/AsyncCombobox";

export default function SchoolInFrance({ school, onSelectSchool, errors, corrections = null }) {
  const [city, setCity] = useState(school?.city);
  const [schools, setSchools] = useState([]);

  const [manualFilling, setManualFilling] = useState(school?.fullName && !school?.id);
  const [manualSchool, setManualSchool] = useState(school ?? {});

  async function getCities(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { responses } = await api.post(`/elasticsearch/schoolramses/public/search?searchCity=${encodeURIComponent(query)}&aggsByCitiesAndDepartments=true`);
        if (!responses[0].aggregations?.cities.buckets.length) {
          return reject("Impossible de récupérer les établissements");
        }
        return resolve({ options: responses[0].aggregations.cities.buckets.map((e) => ({ label: e.key[0] + " - " + e.key[1], value: e.key })) });
      } catch (e) {
        return reject(e);
      }
    });
  }

  async function getSchools() {
    if (!city) return;
    const { responses } = await api.post("/elasticsearch/schoolramses/public/search", {
      filters: { country: ["FRANCE"], city: [city.value.city], departmentName: [city.value.departmentName] },
    });
    setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
  }

  async function handleChangeCity(city) {
    setCity(city);
    await getSchools();
  }

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
      <AsyncCombobox label="Rechercher une commune" hint="Aucune commune trouvée." getOptions={getCities} value={city} onChange={handleChangeCity} error={errors.city} />
      <CreatableSelect
        label="Nom de l'établissement"
        value={school && `${school.fullName} - ${school.adresse}`}
        options={schools
          .map((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`)
          .sort()
          .map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          onSelectSchool(schools.find((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}` === value));
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
