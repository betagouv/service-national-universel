import AsyncCombobox from "@/components/dsfr/forms/AsyncCombobox";
import API from "@/services/api";
import React from "react";

export default function SchoolSearch() {
  const [city, setCity] = React.useState(null);
  console.log("🚀 ~ file: SchoolSearch.jsx:8 ~ SchoolSearch ~ city:", city);
  const [error, setError] = React.useState(null);

  async function getCityOptions(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { responses } = await API.post(`/elasticsearch/schoolramses/public/search?searchCity=${encodeURIComponent(query)}&aggsByCitiesAndDepartments=true`);
        if (!responses[0].aggregations?.cities.buckets.length) {
          return reject("Impossible de récupérer les établissements");
        }
        return resolve({ options: responses[0].aggregations.cities.buckets.map((e) => ({ label: e.key[0] + " - " + e.key[1], value: e.key }))});
      } catch (e) {
        return reject(e);
      }
    });
  }

  return (
    <>
      <AsyncCombobox label="Rechercher une commune" hint="Aucune commune trouvée." getOptions={getCityOptions} value={city} onChange={setCity} error={error} />
    </>
  );
}
