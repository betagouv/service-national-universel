import React from "react";
import AddressDisplay from "./AddressDisplay";
import AddressSearch from "./AddressSearch";

export default function AddressForm({ data, setData }) {
  if (data?.city) return <AddressDisplay data={data} setData={setData} />;
  return <AddressSearch data={data} setData={setData} />;
}
