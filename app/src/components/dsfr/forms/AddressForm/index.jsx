import React from "react";
import AddressDisplay from "./AddressDisplay";
import AddressSearch from "./AddressSearch";

export default function AddressForm({ data, setData, addressOwner = null }) {
  // addressOwner = undefined (young), "host", "parent1", "parent2"
  const ownerField = (field, addressOwner) => `${addressOwner}${field[0].toUpperCase() + field.slice(1)}`;

  function getAddressFromData(data, addressOwner) {
    const fieldsToKeep = ["address", "addressVerified", "zip", "city", "department", "region", "location", "addressType"];

    if (!addressOwner) {
      return Object.fromEntries(Object.entries(data).filter(([key]) => fieldsToKeep.includes(key)));
    }
    let address = {};
    for (const field of fieldsToKeep) {
      address[field] = data[ownerField(field, addressOwner)];
    }
    return address;
  }

  function updateData(values) {
    if (!addressOwner) return setData({ ...data, ...values });
    const newValues = {};
    for (const field in values) {
      newValues[ownerField(field, addressOwner)] = values[field];
    }
    setData({ ...data, ...newValues });
  }

  const address = getAddressFromData(data, addressOwner);

  if (address?.city) return <AddressDisplay data={address} updateData={updateData} />;
  return <AddressSearch updateData={updateData} />;
}
