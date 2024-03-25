import { useQuery } from "@tanstack/react-query";
import { department2region } from "snu-lib";

const baseURL = "https://api-adresse.data.gouv.fr/search/?q=";

export default function useAddress({ query, options = {}, enabled = true }) {
  let url = baseURL + encodeURIComponent(query);
  for (const [key, value] of Object.entries(options)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }

  const { data, isError, isPending, refetch } = useQuery({
    queryKey: ["address", query],
    queryFn: async ({ signal }) => {
      const res = await fetch(url, { signal });
      if (!res.ok) {
        throw new Error("Error with api-adresse: " + res.statusText);
      }
      return res.json();
    },
    enabled,
    refetchOnWindowFocus: false,
  });

  const results = data?.features?.map((result) => formatResult(result));

  return { results, isError, isPending, refetch };
}

function formatResult(option) {
  const contextArray = option.properties.context.split(",");

  return {
    address: option.properties.type !== "municipality" ? option.properties.name : "",
    zip: option.properties.postcode,
    city: option.properties.city,
    department: contextArray[1].trim(),
    // Sur le SNU, certains départements d'outre-mer sont rattachés à d'autres régions au lieu d'être une collectivité indépendante
    // (ex: "Wallis-et-Futuna": "Nouvelle-Calédonie") => on utilise un mapping fait maison et non la région de l'API.
    region: department2region(contextArray[1].trim()),
    departmentNumber: contextArray[0].trim(),
    location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    cityCode: option.properties.citycode,
    addressVerified: "true",
    coordinatesAccuracyLevel: option.properties.type,
  };
}
