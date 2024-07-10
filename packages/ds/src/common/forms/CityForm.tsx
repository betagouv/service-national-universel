import React from "react";
import Input from "../inputs/Input";
import Combobox from "../inputs/Combobox";
import { RiSearchLine } from "react-icons/ri";

export type Address = {
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

interface Props {
  label?: string;
  readOnly?: boolean;
  data: Partial<Address>;
  updateData: (data: Partial<Address>) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  options: Address[];
}

export default function CityForm({
  label = "Rechercher une ville",
  readOnly = false,
  data,
  updateData,
  query,
  setQuery,
  options,
}: Props) {
  function resetData() {
    updateData({
      city: "",
      zip: "",
      addressVerified: "false",
      department: "",
      region: "",
      location: null,
      coordinatesAccuracyLevel: null,
    });
  }

  if (data?.city) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ville"
          value={`${data.city} ${data.zip}`}
          onChange={(value: string) => {
            const [city, zip] = value.split(", ");
            updateData({ ...data, city, zip });
          }}
          className="col-span-2"
          readOnly={true}
        />
        {!readOnly && (
          <button
            onClick={resetData}
            className="col-span-2 text-blue-600 hover:text-blue-800 ml-auto py-1 flex gap-2 items-center"
          >
            <RiSearchLine />
            Rechercher une nouvelle ville
          </button>
        )}
      </div>
    );
  }

  return (
    <Combobox
      label={label}
      setQuery={setQuery}
      options={options?.map((o) => ({
        label: `${o.zip} ${o.city}`,
        value: o,
      }))}
      value={query}
      onChange={(option) => updateData(option.value)}
    />
  );
}
