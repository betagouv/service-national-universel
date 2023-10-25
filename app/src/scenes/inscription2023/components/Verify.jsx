import React from "react";
import CheckBox from "@/components/dsfr/forms/checkbox";

export default function Verify({ recto, verso, checked, setChecked }) {
  console.log("🚀 ~ file: Verify.jsx:5 ~ Verify ~ verso:", verso);
  console.log("🚀 ~ file: Verify.jsx:5 ~ Verify ~ recto:", recto);
  return (
    <>
      {/* TODO: add file type check */}
      <div className="mb-4 flex h-48 w-full space-x-2 overflow-x-auto">
        {recto && <img src={URL.createObjectURL(recto)} className="w-3/4 object-contain" />}
        {verso && <img src={URL.createObjectURL(verso)} className="w-3/4 object-contain" />}
      </div>
      <p className="my-4 text-lg font-semibold text-gray-800">Vérifiez les points suivants</p>
      {Object.entries(checked).map(([key, value]) => (
        <div className="my-2 flex items-center" key={key}>
          <CheckBox type="checkbox" checked={value} onChange={() => setChecked({ ...checked, [key]: !checked[key] })} />
          <span className="ml-2 mr-2">{key}</span>
        </div>
      ))}
    </>
  );
}
