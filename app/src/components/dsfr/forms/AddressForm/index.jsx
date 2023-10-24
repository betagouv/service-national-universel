import React from "react";
import AddressDisplay from "./AddressDisplay";
import AddressSearch from "./AddressSearch";

export default function AddressForm({ data, updateData, getOptions, error, correction }) {
  if (data?.city) return <AddressDisplay data={data} updateData={updateData} correction={correction} />;
  return <AddressSearch getOptions={getOptions} updateData={updateData} error={error} />;
}
