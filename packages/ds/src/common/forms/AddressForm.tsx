import React from "react";
import Input from "../inputs/Input";
import Hint from "../ui/Hint";
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
  readOnly?: boolean;
  data: Partial<Address>;
  updateData: (data: Partial<Address>) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  options: Address[];
  disabled?: boolean;
}

export default function AddressForm({
  label = "Rechercher une adresse",
  readOnly = false,
  data,
  updateData,
  query,
  setQuery,
  options,
  disabled = false,
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
          disabled={
            readOnly ||
            data?.coordinatesAccuracyLevel === "housenumber" ||
            disabled
          }
          className="col-span-2"
        />
        <Input
          label="Ville"
          value={data.city}
          disabled={readOnly || disabled}
          className="col-span-2 md:col-span-1"
        />
        <Input
          label="Code postal"
          value={data.zip}
          disabled={readOnly || disabled}
          className="col-span-2 md:col-span-1"
        />
        {!readOnly && !disabled && (
          <button
            onClick={resetData}
            className="col-span-2 text-blue-600 hover:text-blue-800 ml-auto py-1 flex gap-2 items-center"
          >
            <RiSearchLine />
            Rechercher une nouvelle adresse
          </button>
        )}
      </div>
    );

  return (
    <>
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
      <Hint>
        Si l&apos;adresse n&apos;est pas reconnue, veuillez saisir le nom de la
        ville.
      </Hint>
    </>
  );
}
