import React, { useState } from "react";
import ExportComponent from "../../components/ExportXlsx";
import { getSelectedFilterLabel, translateFilter, capitalizeFirstLetter } from "../../utils";
import { Modal } from "reactstrap";
import { SelectedFilters, StateProvider } from "@appbaseio/reactivesearch";
import plausibleEvent from "../../services/pausible";
import { ModalContainer } from "../../components/modals/Modal";
import ExportFieldCard from "../ExportFieldCard";
import { translateIndexes } from "snu-lib";

export default function ModalExport({ isOpen, setIsOpen, index, transform, exportFields, filters, getExportQuery }) {
  const [selectedFields, setSelectedFields] = useState(exportFields.map((e) => e.id));
  const fieldsToExport = [].concat(...exportFields.filter((e) => selectedFields.includes(e.id)).map((e) => e.fields));

  return (
    <Modal toggle={() => setIsOpen(false)} isOpen={isOpen} onCancel={() => setIsOpen(false)} size="xl" centered>
      <ModalContainer>
        <div className="w-full px-4">
          <div className="text-2xl text-center mb-4">Sélectionnez les données à exporter</div>
          <SelectedFilters
            showClearAll={false}
            render={(props) => {
              const { selectedValues } = props;
              let areAllFiltersEmpty = true;
              for (const item of Object.keys(selectedValues)) {
                if (selectedValues[item].value.length > 0) areAllFiltersEmpty = false;
              }
              if (!areAllFiltersEmpty) {
                return (
                  <div className="rounded-xl bg-gray-50 py-3">
                    <div className="text-center text-base text-gray-400">Rappel des filtres appliqués</div>
                    <div className="mt-2 mx-auto text-center text-base text-gray-600">
                      {console.log("🚀 ~ file: ModalExport.js ~ line 37 ~ ModalExport ~ Object.values(selectedValues", Object.values(selectedValues))}
                      {Object.values(selectedValues)
                        .filter((e) => e.value.length > 0)
                        .map((e) => getSelectedFilterLabel(e.value, translateFilter(e.label)))
                        .join(" • ")}
                    </div>
                  </div>
                );
              } else {
                return <div></div>;
              }
            }}
          />

          <div className="flex pt-4 pb-1">
            <div className="w-1/2 text-left">Sélectionnez pour choisir des sous-catégories</div>
            <div className="w-1/2 text-right flex flex-row-reverse">
              {selectedFields == "" ? (
                <div className="text-snu-purple-300 cursor-pointer" onClick={() => setSelectedFields(exportFields.map((e) => e.id))}>
                  Tout sélectionner
                </div>
              ) : (
                <div className="text-snu-purple-300 cursor-pointer" onClick={() => setSelectedFields([])}>
                  Tout déselectionner
                </div>
              )}
              <StateProvider
                render={({ searchState }) => {
                  return <div className="mr-2">{searchState.result.hits?.total} résultats</div>;
                }}
              />
            </div>
          </div>
        </div>

        <div className="h-[60vh] overflow-auto grid grid-cols-2 gap-4 w-full p-4">
          {exportFields.map((category) => (
            <ExportFieldCard key={category.id} category={category} selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 w-full p-4 drop-shadow-[0_0_10px_rgb(220,220,220)] bg-white">
          <button className="rounded-md border bg-white hover:drop-shadow text-gray-500 font-semibold" onClick={() => setIsOpen(false)}>
            Annuler
          </button>
          <div className="flex w-full">
            <ExportComponent
              handleClick={() => plausibleEvent(`${capitalizeFirstLetter(translateIndexes(index))}/CTA - Exporter ${translateIndexes(index)}`)}
              title={`Exporter les ${translateIndexes(index)}`}
              defaultQuery={getExportQuery}
              exportTitle={capitalizeFirstLetter(translateIndexes(index))}
              index={index}
              react={{ and: filters }}
              transform={(data) => transform(data, selectedFields)}
              fieldsToExport={fieldsToExport}
              setIsOpen={setIsOpen}
              css={{
                override: true,
                button: `bg-brand-purple rounded-md px-4 py-2 text-sm text-white font-semibold w-full hover:bg-brand-darkPurple`,
                loadingButton: `bg-brand-transPurple rounded-md px-4 py-2 text-sm text-white font-semibold w-full`,
              }}
            />
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
}
