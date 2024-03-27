import React, { useState } from "react";
import useAddress from "@/services/useAddress";
import { useDebounce } from "@uidotdev/usehooks";
import Combobox from "../Combobox";

export default function AddressSearch({ updateData, label }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  return <Combobox label={label} setQuery={setQuery} options={results} value={query} onChange={updateData} />;
}
