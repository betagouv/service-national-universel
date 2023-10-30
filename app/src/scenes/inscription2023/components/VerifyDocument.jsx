import React from "react";
import CheckBox from "@/components/dsfr/forms/checkbox";

export default function Verify({ recto, verso, checked, setChecked }) {
  const imageFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  return (
    <>
      <div className="mb-4 flex h-48 w-full space-x-2 overflow-x-auto">
        {imageFileTypes.includes(recto?.type) && <img src={URL.createObjectURL(recto)} className="w-3/4 object-contain" />}
        {imageFileTypes.includes(verso?.type) && <img src={URL.createObjectURL(verso)} className="w-3/4 object-contain" />}
      </div>
      <p className="text-lg font-semibold text-gray-800">Vos documents sont-ils conformes ?</p>
      <p className="text-sm text-gray-500 my-1">Vérifiez et cochez les points ci-dessous</p>
      <div className="my-4">
        <div className="my-3 flex items-center gap-3">
          <CheckBox type="checkbox" checked={checked.lisible} onChange={() => setChecked({ ...checked, lisible: !checked.lisible })} />
          <p>
            Toutes les informations sont <strong>lisibles</strong>
          </p>
        </div>
        <div className="my-3 flex items-center gap-3">
          <CheckBox type="checkbox" checked={checked.pas_coupe} onChange={() => setChecked({ ...checked, pas_coupe: !checked.pas_coupe })} />
          <p>
            Le document n'est <strong>pas coupé</strong>
          </p>
        </div>
        <div className="my-3 flex items-center gap-3">
          <CheckBox type="checkbox" checked={checked.nette} onChange={() => setChecked({ ...checked, nette: !checked.nette })} />
          <p>
            La photo est <strong>nette</strong>
          </p>
        </div>
      </div>
    </>
  );
}
