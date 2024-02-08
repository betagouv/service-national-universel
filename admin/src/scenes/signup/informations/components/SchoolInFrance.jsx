import React, { useState } from "react";
import AsyncCombobox from "@/components/dsfr/forms/AsyncCombobox";
import api from "@/services/api";
import ComboBox from "@/components/dsfr/forms/ComboBox";
import { capture } from "@/sentry";

export async function getCities(query) {
  try {
    const { responses } = await api.post(`/elasticsearch/schoolramses/public/search?searchCity=${encodeURIComponent(query)}&aggsByCitiesAndDepartments=true`);
    const cities = responses[0].aggregations.cities.buckets;
    return cities.map((e) => ({ label: e.key[0] + " - " + e.key[1], value: e.key })) ?? [];
  } catch (e) {
    capture(e);
    return [];
  }
}

export async function getSchools(city) {
  try {
    const { responses } = await api.post("/elasticsearch/schoolramses/public/search", {
      filters: { country: ["FRANCE"], city: [city.value[0]], departmentName: [city.value[1]] },
    });
    const schools = responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } }));
    return schools;
  } catch (e) {
    capture(e);
  }
}

export default function SchoolInFrance({ school, onSelectSchool, errors, corrections = null }) {
  const [city, setCity] = useState(school?.city);
  const [schools, setSchools] = useState([]);

  async function handleChangeCity(city) {
    if (!city) {
      setCity(null);
      return;
    }
    onSelectSchool(undefined);
    setCity(city);
    if (!city?.value.length === 2) return;
    const schools = await getSchools(city);
    setSchools(schools);
  }

  return (
    <>
      <AsyncCombobox label="Rechercher une commune" hint="Aucune commune trouvée." getOptions={getCities} value={city} onChange={handleChangeCity} error={errors?.city} />
      <ComboBox
        label="Nom de l'établissement"
        value={school?.fullName && `${school.fullName} - ${school.adresse}`}
        options={schools
          .map((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`)
          .sort()
          .map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          onSelectSchool(schools.find((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}` === value));
        }}
        placeholder="Sélectionnez un établissement"
      />
    </>
  );
}
