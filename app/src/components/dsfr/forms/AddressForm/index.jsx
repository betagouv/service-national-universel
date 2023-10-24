import React from "react";
import AddressDisplay from "./AddressDisplay";
import AddressSearch from "./AddressSearch";

export default function AddressForm({ data, updateData, error, correction }) {
  if (data?.city) return <AddressDisplay data={data} updateData={updateData} correction={correction} />;
  return <AddressSearch updateData={updateData} error={error} />;
}
