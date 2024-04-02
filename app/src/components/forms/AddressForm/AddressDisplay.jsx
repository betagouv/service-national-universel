import React from "react";
import Input from "../inputs/Input";
import { RiSearchLine } from "react-icons/ri";

export default function AddressDisplay({ data, updateData }) {
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

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Adresse"
        value={data.address}
        onChange={(value) => updateData({ ...data, address: value })}
        disabled={data?.coordinatesAccuracyLevel === "housenumber"}
        className="col-span-2 mb-0"
      />
      <Input label="Ville" value={data.city} disabled className="col-span-2 md:col-span-1 mb-0" />
      <Input label="Code postal" value={data.zip} disabled className="col-span-2 md:col-span-1 mb-0" />

      <button onClick={resetData} className="col-span-2 text-blue-600 hover:text-blue-800 text-center py-1 flex gap-2 items-center">
        <RiSearchLine />
        Rechercher une nouvelle adresse
      </button>
    </div>
  );
}
