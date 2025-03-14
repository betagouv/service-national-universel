import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { InputText } from "@snu/ds/admin";
import React, { useMemo, useState } from "react";
import { CampagneJeuneType, CohortType, DestinataireListeDiffusion } from "snu-lib";
import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";
import { useCampagneSpecifique } from "./CampagneSpecifiqueHook";
import { CampagneSpecifiqueFormData, CampagneSpecifiqueForm, DraftCampagneSpecifiqueFormData } from "./CampagneSpecifiqueForm";
import { ModalImportCampagnBrevo } from "@/components/modals/ModalImportCampagnBrevo";
import { useToggle } from "react-use";

interface CampagneSpecifiqueProps {
  session: CohortType;
}

export interface CampagneSpecificData {
  campagneGeneriqueId: string[];
  cohortId: string;
  generic: boolean;
}

export default function CampagneSpecifique({ session }: CampagneSpecifiqueProps) {
  const sessionId = session._id!;
  const { campagnes, saveCampagne, isLoading } = useCampagneSpecifique({ sessionId });
  const [searchTerm, setSearchTerm] = useState("");
  const [draftCampagne, setDraftCampagne] = useState<DraftCampagneSpecifiqueFormData | null>(null);
  const [isImportCampagneSpecifique, setIsImportCampagneSpecifique] = useToggle(false);

  const { listesDiffusion } = useListeDiffusion();

  const listeDiffusionOptions = useMemo(() => {
    return listesDiffusion.map((liste) => ({
      value: liste.id,
      label: liste.nom,
    }));
  }, [listesDiffusion]);

  const createNewCampagne = () => {
    const newCampagne: DraftCampagneSpecifiqueFormData = {
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      cohortId: sessionId,
    };
    setDraftCampagne(newCampagne);
  };

  const handleImportCampagneGenerique = (data: CampagneSpecificData) => {
    data.campagneGeneriqueId.forEach((genericId) => {
      const newSpecificCampaign = {
        campagneGeneriqueId: genericId,
        cohortId: data.cohortId,
        generic: false,
      };
      saveCampagne({ payload: newSpecificCampaign as any });
    });
  };

  const handleOnSave = (campagne: CampagneSpecifiqueFormData & { generic: false }) => {
    saveCampagne(
      {
        id: campagne.id,
        payload: campagne,
      },
      {
        onSuccess: () => {
          setDraftCampagne(null);
        },
      },
    );
  };

  const filteredCampagnes = useMemo(() => {
    const allCampagnes = draftCampagne ? [draftCampagne, ...campagnes] : campagnes;
    return allCampagnes
      .filter((campagne) => campagne.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || !campagne.nom)
      .sort((a, b) => ((a.createdAt ?? "") > (b.createdAt ?? "") ? 1 : -1));
  }, [campagnes, searchTerm, draftCampagne]);

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
          <div className="text-2xl font-bold leading-7 text-gray-900">Campagnes Spécifiques</div>
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
            key={`campagne-${campagne.id}`}
            campagneData={campagne}
            listeDiffusionOptions={listeDiffusionOptions}
            onSave={handleOnSave}
            onCancel={() => setDraftCampagne(null)}
          />
        ))}
      </div>

      <ModalImportCampagnBrevo
        isOpen={isImportCampagneSpecifique}
        onClose={() => setIsImportCampagneSpecifique(false)}
        onConfirm={handleImportCampagneGenerique}
        cohort={session}
        campagneSpecific={campagnes}
      />
    </>
  );
}
