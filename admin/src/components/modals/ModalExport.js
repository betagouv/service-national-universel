import React, { useState } from "react";
import ExportComponent from "../../components/ExportXlsx";
import { getSelectedFilterLabel, translateFilter } from "../../utils";
import { Modal } from "reactstrap";
import { SelectedFilters, StateProvider } from "@appbaseio/reactivesearch";
import plausibleEvent from "../../services/pausible";

import LoadingButton from "../../components/buttons/LoadingButton";
import { ModalContainer } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import ExportFieldCard from "../ExportFieldCard";

export default function ModalExport({ title, transform, exportFields, filters, getExportQuery }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState(exportFields.map((e) => e.id));
  const fieldsToExport = [].concat(...exportFields.filter((e) => selectedFields.includes(e.id)).map((e) => e.fields));

  return (
    <>
      <LoadingButton onClick={() => setIsOpen(true)}>{title}</LoadingButton>
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

          <div className="h-[60vh] overflow-auto grid grid-cols-2 gap-4 w-full p-3">
            {exportFields.map((category) => (
              <ExportFieldCard key={category.id} category={category} selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
            ))}
          </div>
          <div className="flex gap-2 justify-center mb-3">
            <div className="w-1/2 p-0.5">
              <ModalButton onClick={() => setIsOpen(false)}>Annuler</ModalButton>
            </div>
            <div className="flex mt-2 w-1/2 h-10">
              <ExportComponent
                handleClick={() => plausibleEvent("Volontaires/CTA - Exporter volontaires")}
                title="Exporter les volontaires"
                defaultQuery={getExportQuery}
                exportTitle="Volontaires"
                index="young"
                react={{ and: filters }}
                transform={(data) => transform(data, selectedFields)}
                fieldsToExport={fieldsToExport}
              />
            </div>
          </div>
        </ModalContainer>
      </Modal>
    </>
  );
}
