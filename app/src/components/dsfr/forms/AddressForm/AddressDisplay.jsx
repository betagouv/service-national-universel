import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import React from "react";
import { RiSearchLine } from "react-icons/ri";
import { HiCheckCircle } from "react-icons/hi";
import { Input } from "@snu/ds/dsfr";
import plausibleEvent from "@/services/plausible";
import useAuth from "@/services/useAuth";

export default function AddressDisplay({ data, updateData, error, correction }) {
  const userIsInInscription = window.location.pathname.includes("inscription");
  const { isCLE } = useAuth();

  function handleClick() {
    if (userIsInInscription) {
      const eventName = isCLE ? "CLE/CTA inscription - rechercher nouvelle adresse" : "Phase0/CTA inscription - rechercher nouvelle adresse";
      plausibleEvent(eventName);
    }
    updateData({ address: "", addressVerified: "false", zip: "", city: "", department: "", region: "", location: null, coordinatesAccuracyLevel: null });
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="Adresse"
        nativeInputProps={{
          value: data.address || data.adresse,
          onChange: (e) => updateData({ ...data, address: e.target.value }),
        }}
        disabled={data?.coordinatesAccuracyLevel === "housenumber"}
        state={data?.coordinatesAccuracyLevel === "housenumber" ? "success" : correction?.address && error}
        stateRelatedMessage={correction?.address}
      />

      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
        <Input
          className="w-full"
          label="Ville"
          nativeInputProps={{
            value: data.city,
          }}
          disabled
          state={correction?.address ? "error" : "success"}
          stateRelatedMessage={correction?.address}
        />
        <Input
          className="w-full mb-4"
          label="Code Postal"
          nativeInputProps={{
            value: data.zip,
          }}
          disabled
          state={correction?.zip ? "error" : "success"}
          stateRelatedMessage={correction?.zip}
        />
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <button onClick={handleClick} className="text-blue-france-sun-113 hover:text-blue-france-sun-113-hover ml-auto py-1 w-fit flex gap-2 items-center">
        <RiSearchLine />
        Rechercher une nouvelle adresse
      </button>
    </div>
  );
}
