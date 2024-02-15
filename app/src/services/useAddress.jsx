import { useQuery } from "@tanstack/react-query";
import { departmentLookUp } from "snu-lib";

const baseURL = "https://api-adresse.data.gouv.fr/search/";

export default function useAddress({ query, options = {}, enabled = true }) {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["address", query],
    queryFn: ({ signal }) => fetchAddress({ signal, query, options }),
    enabled,
    refetchOnWindowFocus: false,
  });

  const results = data?.features?.map((result) => formatResult(result));
  const location = results?.length > 0 ? { lon: results[0].location.lon, lat: results[0].location.lat } : null;

  return { location, results, error, isPending, refetch };
}

async function fetchAddress({ signal, query, options = {} }) {
  let url = baseURL + "?q=" + encodeURIComponent(query);
  for (const [key, value] of Object.entries(options)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

function formatResult(option) {
  const arr = option.properties.context.split(",");
  const departmentNumber = arr[0].trim();
  const department = departmentLookUp[departmentNumber];
  const region = arr[arr.length - 1].trim();

  return {
    address: option.properties.type !== "municipality" ? option.properties.name : "",
    zip: option.properties.postcode,
    city: option.properties.city,
    department,
    departmentNumber,
    location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
    region,
    cityCode: option.properties.citycode,
    addressVerified: "true",
    coordinatesAccuracyLevel: option.properties.type,
  };
}
