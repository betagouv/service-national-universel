import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { InputText } from "@snu/ds/admin";
import React, { useMemo, useState, useRef, createRef } from "react";
import { CampagneJeuneType, CohortDto, DestinataireListeDiffusion } from "snu-lib";
import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";
import { useCampagneSpecifique } from "./CampagneSpecifiqueHook";
import { CampagneSpecifiqueFormData, CampagneSpecifiqueForm, DraftCampagneSpecifiqueFormData, CampagneSpecifiqueFormRefMethods } from "./CampagneSpecifiqueForm";
import { ModalImportCampagneBrevo } from "@/components/modals/ModalImportCampagneBrevo";
import { useToggle } from "react-use";
import { useSearchTerm } from "../hooks/useSearchTerm";

interface CampagneSpecifiqueProps {
  session: CohortDto;
}

export interface CampagnesGeneriquesImportData {
  campagneGeneriqueId: string[];
}

export default function CampagneSpecifique({ session }: CampagneSpecifiqueProps) {
  const sessionId = session._id!;
  const { campagnes, saveCampagne, sendCampagne, isLoading } = useCampagneSpecifique({ sessionId });
  const [draftCampagne, setDraftCampagne] = useState<DraftCampagneSpecifiqueFormData | null>(null);
  const [isImportCampagneSpecifique, setIsImportCampagneSpecifique] = useToggle(false);

  const { listesDiffusion } = useListeDiffusion();

  const listeDiffusionOptions = useMemo(() => {
    return listesDiffusion.map((liste) => ({
      value: liste.id,
      label: liste.nom,
    }));
  }, [listesDiffusion]);

  const formRefs = useRef<Record<string, React.RefObject<CampagneSpecifiqueFormRefMethods>>>({});

  const allCampagnes = useMemo(() => {
    const campagnesArray = draftCampagne ? [draftCampagne, ...campagnes] : campagnes;

    campagnesArray.forEach((campagne) => {
      const id = campagne.id || "draft";
      if (!formRefs.current[id]) {
        formRefs.current[id] = createRef<CampagneSpecifiqueFormRefMethods>();
      }
    });

    return campagnesArray;
  }, [campagnes, draftCampagne]);

  const { searchTerm, setSearchTerm, filteredItems: filteredCampagnes } = useSearchTerm(allCampagnes, (campagne) => campagne.nom, { sortBy: "createdAt" });

  const createNewCampagne = () => {
    const newCampagne: DraftCampagneSpecifiqueFormData = {
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      cohortId: sessionId,
    };
    setDraftCampagne(newCampagne);
  };

  const handleImportCampagneGenerique = (data: CampagnesGeneriquesImportData) => {
    data.campagneGeneriqueId.forEach((genericId) => {
      const newSpecificCampaign: CampagneSpecifiqueFormData & { generic: false } = {
        campagneGeneriqueId: genericId,
        cohortId: sessionId,
        generic: false as const,
        nom: "",
        type: CampagneJeuneType.VOLONTAIRE,
        listeDiffusionId: "",
        templateId: 0,
        objet: "",
        destinataires: [DestinataireListeDiffusion.JEUNES],
      };
      saveCampagne({
        payload: newSpecificCampaign,
      });
    });
  };

  const handleOnSave = (campagne: CampagneSpecifiqueFormData & { generic: false }) => {
    const formId = campagne.id || "draft";
    const formRef = formRefs.current[formId];

    saveCampagne({
      id: campagne.id,
      payload: campagne,
      onSuccess: (success, errors) => {
        if (success) {
          setDraftCampagne(null);
          if (formRef && formRef.current) {
            formRef.current.resetForm(campagne);
          }
        } else if (errors && Object.keys(errors).length > 0 && formRef && formRef.current) {
          formRef.current.resetForm({
            ...campagne,
            validationErrors: errors,
          });
        }
      },
    });
  };

  const handleSend = (id: string) => {
    sendCampagne(id);
  };

  const isNouvelleCampagneDisabled = useMemo(() => {
    return draftCampagne !== null;
  }, [draftCampagne]);

  if (isLoading) {
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
          <div className="text-2xl font-bold leading-7 text-gray-900">Marketing</div>
          <div className="flex items-center gap-4">
            <InputText value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher" className="w-[200px]" name="search" />
            <ButtonPrimary disabled={isNouvelleCampagneDisabled} onClick={createNewCampagne} className="h-[50px] w-[300px]">
              Nouvelle campagne
            </ButtonPrimary>
            <ButtonPrimary onClick={() => setIsImportCampagneSpecifique(true)} className="h-[50px] w-[300px]">
              Importer une campagne
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {filteredCampagnes.map((campagne) => (
          <CampagneSpecifiqueForm
            key={`campagne-${campagne.id || "draft"}`}
            ref={formRefs.current[campagne.id || "draft"]}
            campagneData={campagne}
            listeDiffusionOptions={listeDiffusionOptions}
            onSave={handleOnSave}
            onCancel={() => {
              setDraftCampagne(null);
            }}
            onSend={handleSend}
          />
        ))}
      </div>

      <ModalImportCampagneBrevo
        isOpen={isImportCampagneSpecifique}
        onClose={() => setIsImportCampagneSpecifique(false)}
        onConfirm={handleImportCampagneGenerique}
        cohort={session}
        campagnesSpecifiques={campagnes}
      />
    </>
  );
}
