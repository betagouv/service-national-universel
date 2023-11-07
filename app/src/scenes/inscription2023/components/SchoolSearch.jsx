import AsyncCombobox from "@/components/dsfr/forms/AsyncCombobox";
import API from "@/services/api";
import React from "react";
import { toastr } from "react-redux-toastr";

export default function SchoolSearch() {
  const [city, setCity] = React.useState(null);
  const [error, setError] = React.useState(null);

  // async function getAddressOptions(query, signal) {
  //   // Call BAN API
  //   const res = await apiAdress(query, { limit: 10 }, { signal });
  //   if (!res) return [[], null];
  //   if (res.error) return [null, res.error];
  //   if (!res.features?.length) return [[], null];

  //   // Format and group options
  //   const formattedOptions = res.features.map((option) => formatOption(option));

  //   const housenumbers = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "housenumber");
  //   const streets = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "street");
  //   const localities = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "locality");
  //   const municipalities = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "municipality");

  //   const options = [];
  //   if (housenumbers.length > 0) options.push({ label: "Numéro", options: housenumbers });
  //   if (streets.length > 0) options.push({ label: "Voie", options: streets });
  //   if (localities.length > 0) options.push({ label: "Lieu-dit", options: localities });
  //   if (municipalities.length > 0) options.push({ label: "Commune", options: municipalities });

  //   return [options, null];
  // }

  async function getOptions(query) {
    // Call ES
    const { responses } = await API.post(`/elasticsearch/schoolramses/public/search?searchCity=${encodeURIComponent(query)}`, { filters: { country: ["FRANCE"] } });
    if (!responses[0].aggregations?.cities.buckets.length) {
      toastr.error("Erreur", "Impossible de récupérer les établissements");
      return;
    }

    // Format options
    return [responses[0].aggregations?.cities.buckets.map((e) => e.key).sort(), null];
  }

  function updateData(option) {
    setCity(option);
  }

  return (
    <>
      <AsyncCombobox label="Rechercher une commune" hint="hint" getOptions={getOptions} updateData={updateData} error={error} />
      <p>Commune sélectionnée : {city}</p>
    </>
  );
}
