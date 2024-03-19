import { useQuery } from "@tanstack/react-query";

const baseURL = "https://api-adresse.data.gouv.fr/search/?q=";

export default function useAddress({ query, options = {}, enabled = true }) {
  let url = baseURL + encodeURIComponent(query);
  for (const [key, value] of Object.entries(options)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }

  const { data, isError, isPending } = useQuery({
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

  return { results, isError, isPending };
}

function formatResult(option) {
  const contextArray = option.properties.context.split(",");

  return {
    label: `${option.properties.name} - ${option.properties.postcode} ${option.properties.city}`,
    address: option.properties.type !== "municipality" ? option.properties.name : "",
    zip: option.properties.postcode,
    city: option.properties.city,
    country: "France",
    // For metropolitan areas, the second element is the department, and the third element is the region
    // For some overseas areas, the second element is both the department and the region, and there is no third element
    department: contextArray[1].trim(),
    region: contextArray[contextArray.length - 1].trim(),
    departmentNumber: contextArray[0].trim(),
    location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    cityCode: option.properties.citycode,
    addressVerified: "true",
    coordinatesAccuracyLevel: option.properties.type,
  };
}
