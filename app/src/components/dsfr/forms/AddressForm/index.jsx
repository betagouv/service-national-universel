import React from "react";
import AddressDisplay from "./AddressDisplay";
import AddressSearch from "./AddressSearch";

export default function AddressForm({ data, updateData }) {
  if (data?.city) return <AddressDisplay data={data} updateData={updateData} />;
  return <AddressSearch updateData={updateData} />;
}
