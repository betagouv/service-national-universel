import React from "react";
import Input from "../inputs/Input";
import Combobox from "../inputs/Combobox";
import { RiSearchLine } from "react-icons/ri";

export type Address = {
  address: string;
  city: string;
  zip: string;
  department: string;
  region: string;
  location: {
    lat: number;
    lon: number;
  } | null;
  coordinatesAccuracyLevel: string | null;
  addressVerified: "true" | "false";
};

interface proptype {
  label?: string;
  data: Address;
  updateData: (data: Address) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  options: Address[];
}

export default function AddressForm({
  label = "Rechercher une adresse",
  data,
  updateData,
  query,
  setQuery,
  options,
}: proptype) {
  function resetData() {
    updateData({
      address: "",
      addressVerified: "false",
      zip: "",
      city: "",
      department: "",
      region: "",
      location: null,
      coordinatesAccuracyLevel: null,
    });
  }

  if (data?.city)
    return (
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Adresse"
          value={data.address}
          onChange={(value: string) => updateData({ ...data, address: value })}
          disabled={data?.coordinatesAccuracyLevel === "housenumber"}
          className="col-span-2"
        />
        <Input
          label="Ville"
          value={data.city}
          disabled
          className="col-span-2 md:col-span-1"
        />
        <Input
          label="Code postal"
          value={data.zip}
          disabled
          className="col-span-2 md:col-span-1"
        />
        <button
          onClick={resetData}
          className="col-span-2 text-blue-600 hover:text-blue-800 ml-auto py-1 flex gap-2 items-center"
        >
          <RiSearchLine />
          Rechercher une nouvelle adresse
        </button>
      </div>
    );

  return (
    <Combobox
      label={label}
      setQuery={setQuery}
      options={options?.map((o) => ({
        label: `${o.address ? `${o.address} - ` : ""}${o.zip} ${o.city}`,
        value: o,
      }))}
      value={query}
      onChange={(option) => updateData(option.value)}
    />
  );
}
