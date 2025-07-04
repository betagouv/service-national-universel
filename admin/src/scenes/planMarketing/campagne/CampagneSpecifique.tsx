import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { InputText, Modal, Button } from "@snu/ds/admin";
import React, { useMemo, useState, useRef, createRef } from "react";
import { CampagneJeuneType, CohortDto, DestinataireListeDiffusion } from "snu-lib";
import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";
import { useCampagneSpecifique } from "./CampagneSpecifiqueHook";
import { CampagneSpecifiqueFormData, CampagneSpecifiqueForm, DraftCampagneSpecifiqueFormData, CampagneSpecifiqueFormRefMethods } from "./CampagneSpecifiqueForm";
import { ModalImportCampagneBrevo } from "@/components/modals/ModalImportCampagneBrevo";
import { useToggle } from "react-use";
import { useSearchTerm } from "../hooks/useSearchTerm";
import { HiOutlineExclamation } from "react-icons/hi";
import PlanMarketingFilters, { CampagneSpecifiqueFilters } from "../components/filters/PlanMarketingFilters";
import { usePlanMarketingFilters } from "../components/filters/PlanMarketingFiltersHook";
import { useSendMailTest } from "../hooks/SendMailTest";

interface CampagneSpecifiqueProps {
  session: CohortDto;
}

export interface CampagnesGeneriquesImportData {
  campagneGeneriqueId: string[];
}

export default function CampagneSpecifique({ session }: CampagneSpecifiqueProps) {
  const sessionId = session._id!;

  const { filters, setFilters } = usePlanMarketingFilters<CampagneSpecifiqueFilters>(() => {}, { isArchived: false });
  const { campagnes, saveCampagne, sendCampagne, toggleArchivageCampagne, isToggleArchivagePending } = useCampagneSpecifique({
    sessionId,
    filters,
  });
  const { sendTest } = useSendMailTest();
  const [draftCampagne, setDraftCampagne] = useState<DraftCampagneSpecifiqueFormData | null>(null);
  const [isImportCampagneSpecifique, setIsImportCampagneSpecifique] = useToggle(false);
  const [keepOpenCampagneIds, setKeepOpenCampagneIds] = useState<Set<string>>(new Set());
  const [isArchiveToggleModalOpen, setIsArchiveToggleModalOpen] = useState<boolean>(false);
  const [selectedCampagne, setSelectedCampagne] = useState<DraftCampagneSpecifiqueFormData | null>(null);

  const { listesDiffusion } = useListeDiffusion();

  const listeDiffusionOptions = useMemo(() => {
    return listesDiffusion.map((liste) => ({
      value: liste.id,
      label: liste.nom + (liste.isArchived ? " (Archivée)" : ""),
      disabled: liste.isArchived,
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

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredCampagnes,
  } = useSearchTerm<CampagneSpecifiqueFormData>(allCampagnes as CampagneSpecifiqueFormData[], (campagne) => campagne.nom, { sortBy: "createdAt" });

  const createNewCampagne = () => {
    const newCampagne: DraftCampagneSpecifiqueFormData = {
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      cohortId: sessionId,
    };
    setDraftCampagne(newCampagne);
  };

  const handleFiltersChange = (newFilters: CampagneSpecifiqueFilters) => {
    setFilters(newFilters);
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
        envois: [],
      };
      saveCampagne({
        payload: newSpecificCampaign,
      });
    });
  };

  const handleOnSave = (campagne: CampagneSpecifiqueFormData & { generic: false }) => {
    const formId = campagne.id || "draft";
    const formRef = formRefs.current[formId];
    const isNewCampaign = !campagne.id;

    saveCampagne({
      id: campagne.id,
      payload: campagne,
      onSuccess: (success, errors, savedId) => {
        if (success) {
          setDraftCampagne(null);

          if (isNewCampaign && savedId) {
            setKeepOpenCampagneIds((prev) => new Set([...prev, savedId]));
          }

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

  const handleSend = (id: string, isProgrammationActive?: boolean) => {
    sendCampagne({ id, isProgrammationActive });
  };

  const isNouvelleCampagneDisabled = useMemo(() => {
    return draftCampagne !== null;
  }, [draftCampagne]);

  const handleToggleArchivageCampagne = (campagne: DraftCampagneSpecifiqueFormData) => {
    setSelectedCampagne(campagne);
    setIsArchiveToggleModalOpen(true);
  };

  const confirmToggleArchivage = () => {
    if (selectedCampagne && selectedCampagne.id) {
      toggleArchivageCampagne(selectedCampagne.id);
      setIsArchiveToggleModalOpen(false);
      setSelectedCampagne(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Marketing</div>
          <div className="flex items-center gap-4">
            <PlanMarketingFilters<CampagneSpecifiqueFilters> onChange={handleFiltersChange} filterType="specifique" filters={filters} />
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
            onSendTest={sendTest}
            forceOpen={campagne.id ? keepOpenCampagneIds.has(campagne.id) : false}
            onToggleArchive={handleToggleArchivageCampagne}
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

      <Modal
        isOpen={isArchiveToggleModalOpen}
        onClose={() => setIsArchiveToggleModalOpen(false)}
        className="md:max-w-[600px] text-center"
        header={
          <div className="text-center">
            <HiOutlineExclamation className="bg-gray-100 rounded-full p-2 text-gray-900 mx-auto mb-2" size={48} />
            <h3 className="text-xl font-medium">{selectedCampagne?.isArchived ? "Désarchivage de la campagne" : "Archivage de la campagne"}</h3>
          </div>
        }
        content={
          <div className="text-gray-700">
            {selectedCampagne?.isArchived ? (
              <div>
                <p>
                  La campagne spécifique sera désarchivée. <br />
                  La programmation de cette campagne spécifique ne sera pas réactivée. <br />
                  Pensez à le faire si nécessaire.
                </p>
              </div>
            ) : (
              <div>
                <p>La campagne spécifique sera archivée et la programmation sera désactivée.</p>
                {selectedCampagne?.campagneGeneriqueId && <p>La campagne spécifique sera détachée de la campagne générique</p>}
              </div>
            )}
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-6">
            <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={() => setIsArchiveToggleModalOpen(false)} disabled={isToggleArchivagePending} />
            <Button title={selectedCampagne?.isArchived ? "Désarchiver" : "Archiver"} onClick={confirmToggleArchivage} className="flex-1" loading={isToggleArchivagePending} />
          </div>
        }
      />
    </>
  );
}
