import { useQuery } from "@tanstack/react-query";
import { department2region, departmentLookUp } from "snu-lib";

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
  const contextArray = option.properties.context.split(", ");
  let departmentNumber = contextArray[0];
  // Cas particuliers : codes postaux en Polynésie
  if (["97", "98"].includes(departmentNumber)) {
    departmentNumber = option.properties.postcode.substr(0, 3);
  }

  // Cas particuliers : code postaux en Corse
  if (departmentNumber === "20") {
    departmentNumber = option.properties.context.substr(0, 2);
    if (!["2A", "2B"].includes(departmentNumber)) departmentNumber = "2B";
  }
  const department = departmentLookUp[departmentNumber];
  const region = department2region[department];

  return {
    address: option.properties.type !== "municipality" ? option.properties.name : "",
    zip: option.properties.postcode,
    city: option.properties.city,
    departmentNumber,
    department,
    region,
    location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    cityCode: option.properties.citycode,
    addressVerified: "true",
    coordinatesAccuracyLevel: option.properties.type,
  };
}
