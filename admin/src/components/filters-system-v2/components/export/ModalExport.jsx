import React, { useEffect, useState } from "react";
import { translate, translateField } from "snu-lib";
import ExportFieldCard from "../../../ExportFieldCard";
import ModalTailwind from "../../../modals/ModalTailwind";
import plausibleEvent from "../../../../services/plausible";
import ExportComponent from "./ExportComponent";

export default function ModalExport({ isOpen, setIsOpen, route, transform, exportFields, exportTitle = "", totalHits = false, selectedFilters }) {
  const [selectedFields, setSelectedFields] = useState(exportFields?.map((e) => e.id));
  const fieldsToExport = [].concat(...exportFields.filter((e) => selectedFields.includes(e.id)).map((e) => e.fields));
  const [hasFilter, setHasFilter] = useState(false);

  useEffect(() => {
    setHasFilter(Object.keys(selectedFilters).filter((e) => selectedFilters[e]?.filter?.length).length > 0);
  }, [selectedFilters]);

  return (
    <ModalTailwind isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-[900px] rounded-xl bg-white">
      <div className="space-y-6 px-8 py-6">
        <div className="text-center text-lg">Sélectionnez les données à exporter</div>
        {hasFilter && (
          <div className="space-y-2 rounded-xl bg-gray-100 p-3">
            <p className="text-center text-sm text-gray-400">Rappel des filtres appliqués</p>
            <p className="text-center text-sm text-gray-600">
              {Object.keys(selectedFilters)
                .filter((e) => selectedFilters[e]?.filter?.length && selectedFilters[e]?.filter[0] !== "")
                .map((e) => `${translateField(e)} : ${translate(selectedFilters[e]?.filter)}`)
                .join(" • ")}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <p className="text-left">Sélectionnez pour choisir des sous-catégories</p>
          <div className="flex flex-row-reverse gap-2">
            {selectedFields == "" ? (
              <div className="cursor-pointer text-blue-600 hover:text-blue-400" onClick={() => setSelectedFields(exportFields.map((e) => e.id))}>
                Tout sélectionner
              </div>
            ) : (
              <div className="cursor-pointer text-blue-600 hover:text-blue-400" onClick={() => setSelectedFields([])}>
                Tout déselectionner
              </div>
            )}
            {totalHits && <div className="mr-2">{totalHits} résultats</div>}
          </div>
        </div>
      </div>
      <div className="shadow-[inset_0_-10px_10px_rgb(220,220,220)]">
        <div className="grid h-96 grid-cols-2 gap-4 overflow-auto px-8 pb-6">
          {exportFields.map((category) => (
            <ExportFieldCard key={category.id} category={category} selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 bg-white px-8 pt-8">
        <button className="rounded-md border bg-[#ffffff] text-gray-500 transition hover:bg-[#f9fafb]" onClick={() => setIsOpen(false)}>
          Annuler
        </button>
        <div className="flex w-full">
          <ExportComponent
            handleClick={() => plausibleEvent(`${exportTitle}/CTA - Exporter ${exportTitle}`)}
            title={`Exporter les ${exportTitle}`}
            exportTitle={exportTitle}
            route={route}
            transform={(data) => transform(data, selectedFields)}
            fieldsToExport={fieldsToExport}
            selectedFilters={selectedFilters}
            setIsOpen={setIsOpen}
            customCss={{
              override: true,
              button: "w-full bg-blue-600 text-blue-50 rounded-md px-4 py-2 text-sm hover:brightness-125 transition",
              loadingButton: "w-full bg-blue-600 text-blue-50 rounded-md px-4 py-2 text-sm brightness-75 cursor-not-allowed",
            }}
          />
        </div>
      </div>
    </ModalTailwind>
  );
}
