import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import React from "react";
import { RiSearchLine } from "react-icons/ri";
import { HiCheckCircle } from "react-icons/hi";

export default function AddressDisplay({ data, updateData, error, correction }) {
  const resetData = () => updateData({ address: "", addressVerified: "false", zip: "", city: "", department: "", region: "", location: null, coordinatesAccuracyLevel: null });

  return (
    <div className="flex flex-col gap-2">
      {/* If the user does not select a housenumber, we allow them to input address data, otherwise the address field is disabled */}
      {data?.coordinatesAccuracyLevel === "housenumber" ? (
        <label className="flex flex-col gap-2 w-full">
          Adresse
          <div className="flex w-full items-center bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2">
            <input disabled type="text" value={data.address} className="w-full text-gray-400 bg-transparent" />
            <HiCheckCircle />
          </div>
        </label>
      ) : (
        <>
          <label className="flex flex-col gap-2 w-full text-gray-800">
            Adresse
            <input
              type="text"
              value={data.address}
              onChange={(e) => updateData({ address: e.target.value })}
              className="bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-800 border-b-2 border-gray-800"
            />
          </label>
          <ErrorMessage>{error}</ErrorMessage>
        </>
      )}

      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
        <label className="flex flex-col gap-2 w-full">
          Ville
          <div className="appearance-none flex w-full items-center bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2">
            <input type="text" value={data.city} disabled className="w-full text-gray-400 bg-transparent" />
            <HiCheckCircle />
          </div>
        </label>

        <label className="flex flex-col gap-2 w-full">
          Code postal
          <div className="flex w-full items-center bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2">
            <input type="text" value={data.zip} disabled className="w-full text-gray-400 bg-transparent" />
            <HiCheckCircle />
          </div>
        </label>
      </div>

      <ErrorMessage>{correction}</ErrorMessage>
      <button onClick={resetData} className="text-blue-france-sun-113 hover:text-blue-france-sun-113-hover ml-auto py-1 w-fit flex gap-2 items-center">
        <RiSearchLine />
        Rechercher une nouvelle adresse
      </button>
    </div>
  );
}
