import React, { useEffect, useState } from "react";
import { translate, translateField, translateIndexes } from "snu-lib";
import ExportFieldCard from "../../../ExportFieldCard";
import ModalTailwind from "../../../modals/ModalTailwind";
import plausibleEvent from "../../../../services/plausible";
import { capitalizeFirstLetter } from "../../../../utils";
import ExportComponent from "./ExportComponentV2";

export default function ModalExportV2({ isOpen, setIsOpen, route, transform, exportFields, exportTitle = "", totalHits = false, selectedFilters }) {
  const [selectedFields, setSelectedFields] = useState(exportFields?.map((e) => e.id));
  const fieldsToExport = [].concat(...exportFields.filter((e) => selectedFields.includes(e.id)).map((e) => e.fields));
  const [hasFilter, setHasFilter] = useState(false);

  useEffect(() => {
    setHasFilter(Object.keys(selectedFilters).filter((e) => selectedFilters[e]?.filter?.length).length > 0);
  }, [selectedFilters]);

  return (
    <ModalTailwind isOpen={isOpen} onClose={() => setIsOpen(false)} className="bg-white rounded-xl w-[900px]">
      <div className="px-8 py-6 space-y-6">
        <div className="text-lg text-center">Sélectionnez les données à exporter</div>
        {hasFilter && (
          <div className="rounded-xl bg-gray-100 p-3 space-y-2">
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
              <div className="text-blue-600 hover:text-blue-400 cursor-pointer" onClick={() => setSelectedFields(exportFields.map((e) => e.id))}>
                Tout sélectionner
              </div>
            ) : (
              <div className="text-blue-600 hover:text-blue-400 cursor-pointer" onClick={() => setSelectedFields([])}>
                Tout déselectionner
              </div>
            )}
            {totalHits && <div className="mr-2">{totalHits} résultats</div>}
          </div>
        </div>
      </div>
      <div className="shadow-[inset_0_-10px_10px_rgb(220,220,220)]">
        <div className="overflow-auto grid grid-cols-2 gap-4 px-8 pb-6 h-96">
          {exportFields.map((category) => (
            <ExportFieldCard key={category.id} category={category} selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-8 pt-8 mb-8 bg-white">
        <button className="rounded-md border bg-[#ffffff] text-gray-500 hover:bg-[#f9fafb] transition" onClick={() => setIsOpen(false)}>
          Annuler
        </button>
        <div className="flex w-full">
          <ExportComponent
            handleClick={() => plausibleEvent(`${capitalizeFirstLetter(translateIndexes(index))}/CTA - Exporter ${translateIndexes(index)}`)}
            title={`Exporter les ${exportTitle || translateIndexes(index)}`}
            exportTitle={exportTitle ? capitalizeFirstLetter(exportTitle) : capitalizeFirstLetter(translateIndexes(index))}
            route={route}
            transform={(data) => transform(data, selectedFields)}
            fieldsToExport={fieldsToExport}
            selectedFilters={selectedFilters}
            setIsOpen={setIsOpen}
            css={{
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
