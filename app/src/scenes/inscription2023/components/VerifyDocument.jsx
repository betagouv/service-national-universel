import React from "react";
import { Checkbox } from "@snu/ds/dsfr";

export default function Verify({ recto, verso, checked, setChecked }) {
  const imageFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  return (
    <>
      <div className="mb-4 flex h-48 w-full space-x-2 overflow-x-auto">
        {imageFileTypes.includes(recto?.type) && <img src={URL.createObjectURL(recto)} className="w-3/4 object-contain" />}
        {imageFileTypes.includes(verso?.type) && <img src={URL.createObjectURL(verso)} className="w-3/4 object-contain" />}
      </div>
      <div className="my-4">
        <Checkbox
          legend="Vos documents sont-ils conformes ?"
          hintText="Vérifiez et cochez les points ci-dessous"
          options={[
            {
              label: "Toutes les informations sont lisibles.",
              nativeInputProps: {
                checked: checked.lisible,
                onChange: () => setChecked({ ...checked, lisible: !checked.lisible }),
              },
            },
            {
              label: "Le document n'est pas coupé.",
              nativeInputProps: {
                checked: checked.pas_coupe,
                onChange: () => setChecked({ ...checked, pas_coupe: !checked.pas_coupe }),
              },
            },
            {
              label: "La photo est nette.",
              nativeInputProps: {
                checked: checked.nette,
                onChange: () => setChecked({ ...checked, nette: !checked.nette }),
              },
            },
          ]}
        />
      </div>
    </>
  );
}
