import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { InputText } from "@snu/ds/admin";
import React, { useMemo, useState } from "react";

import { DraftListeDiffusionDataProps, ListeDiffusionDataProps, ListeDiffusionForm } from "./ListeDiffusionForm";
import { useListeDiffusion } from "./ListeDiffusionHook";
import { ListeDiffusionEnum } from "snu-lib";
import { useListeDiffusionFilters } from "./filters/ListeDiffusionFiltersHook";
import { useSearchTerm } from "../hooks/useSearchTerm";

export default function ListeDiffusion() {
  const { listesDiffusion, saveListeDiffusion, isLoading } = useListeDiffusion();
  const [draftListe, setDraftListe] = useState<DraftListeDiffusionDataProps | null>(null);
  const [keepOpenListeIds, setKeepOpenListeIds] = useState<Set<string>>(new Set());

  const { dataVolontaires, filtersVolontaires, dataInscriptions, filtersInscriptions, isPending } = useListeDiffusionFilters({});

  const allListes = useMemo(() => {
    return draftListe ? [draftListe, ...listesDiffusion] : listesDiffusion;
  }, [listesDiffusion, draftListe]);

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredListes,
  } = useSearchTerm<ListeDiffusionDataProps>(allListes as ListeDiffusionDataProps[], (liste) => liste.nom, {
    sortBy: "createdAt",
  });

  const createNewListeDiffusion = () => {
    const newListe: DraftListeDiffusionDataProps = {
      type: ListeDiffusionEnum.VOLONTAIRES,
      filters: {},
    };
    setDraftListe(newListe);
  };

  const handleOnSave = (liste: ListeDiffusionDataProps) => {
    saveListeDiffusion(
      {
        id: liste.id,
        payload: liste,
      },
      {
        onSuccess: (listeDiffusion) => {
          const listeId = listeDiffusion.id;
          setDraftListe(null);
          if (listeId) {
            setKeepOpenListeIds((prev) => new Set([...prev, listeId]));
          }
        },
      },
    );
  };

  const handleOnCancel = () => {
    setDraftListe(null);
  };

  const isNewListeDiffusion = useMemo(() => {
    return draftListe !== null;
  }, [draftListe]);

  if (isLoading || isPending) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Listes de diffusion</div>
          <div className="flex items-center gap-4">
            <InputText value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher" className="w-[200px]" name="search" />
            <ButtonPrimary disabled={isNewListeDiffusion} onClick={createNewListeDiffusion} className="h-[50px] w-[300px]">
              Nouvelle liste de diffusion
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {filteredListes.map((liste) => (
          <ListeDiffusionForm
            key={`liste-diffusion-${liste.id}`}
            listeDiffusionData={liste}
            filter={{
              volontaires: { paramData: dataVolontaires.params, dataFilter: dataVolontaires.filters, filters: filtersVolontaires },
              inscriptions: { paramData: dataInscriptions.params, dataFilter: dataInscriptions.filters, filters: filtersInscriptions },
            }}
            onSave={handleOnSave}
            onCancel={handleOnCancel}
            forceOpen={liste.id ? keepOpenListeIds.has(liste.id) : false}
          />
        ))}
      </div>
    </>
  );
}
