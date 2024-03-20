import React from "react";
import AddressDisplay from "./AddressDisplay";
import AddressSearch from "./AddressSearch";

export default function AddressForm({ data, updateData, label = "Rechercher une adresse", error, correction }) {
  if (data?.city) return <AddressDisplay data={data} updateData={updateData} correction={correction} error={error} />;
  return <AddressSearch updateData={updateData} label={label} error={error} />;
}
