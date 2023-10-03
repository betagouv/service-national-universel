import React from "react";

export default function AddressDisplay({ data, setData }) {
  const resetData = () => setData({ ...data, address: "", addressVerified: "false", zip: "", city: "", department: "", region: "", location: null, addressType: null });

  return (
    <div className="flex flex-col gap-2">
      {data?.addressType === "housenumber" ? (
        <label className="flex flex-col gap-1 w-full text-gray-400">
          Adresse
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            disabled
            className="bg-[#EEEEEE] disabled:bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-800 disabled:text-gray-400 border-b-2 border-gray-800 disabled:border-[#EEEEEE]"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 w-full text-gray-800">
          Compléter mon adresse (numéro, voie, lieu-dit, autre information)
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            className="bg-[#EEEEEE] disabled:bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-800 disabled:text-gray-400 border-b-2 border-gray-800 disabled:border-[#EEEEEE]"
          />
        </label>
      )}

      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
        <label className="flex flex-col gap-1 w-full text-gray-400">
          Code postal
          <input type="text" value={data.zip} disabled className="bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-400" />
        </label>

        <label className="flex flex-col gap-1 w-full text-gray-400">
          Ville
          <input type="text" value={data.city} disabled className="bg-[#EEEEEE] rounded-tl rounded-tr px-3 py-2 text-gray-400" />
        </label>
      </div>

      <button onClick={resetData} className="text-blue-600 text-left py-2 w-fit">
        Rechercher une autre adresse
      </button>
    </div>
  );
}
