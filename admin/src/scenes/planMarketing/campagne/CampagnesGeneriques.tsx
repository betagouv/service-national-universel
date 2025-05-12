import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlanMarketingService from "@/services/planMarketingService";
import { InputText, Modal, Button } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState, useRef } from "react";
import CampagneForm, { CampagneDataProps, DraftCampagneDataProps } from "./CampagneForm";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";
import { useLocation } from "react-router-dom";
import { HiOutlineExclamation } from "react-icons/hi";
import { useCampagneForm } from "./CampagneFormHook";
import { useSearchTerm } from "../hooks/useSearchTerm";
import CampagneFilters, { CampagneGeneriqueFilters } from "./filters/CampagneFilters";
import { useCampagneFilters } from "./filters/CampagneFiltersHook";

export default function CampagnesGeneriques() {
  const [campagnes, setCampagnes] = useState<DraftCampagneDataProps[]>([]);
  const [openCampagneId, setOpenCampagneId] = useState<string | null>(null);
  const [keepOpenCampagneIds, setKeepOpenCampagneIds] = useState<Set<string>>(new Set());
  const [isArchiveToggleModalOpen, setIsArchiveToggleModalOpen] = useState<boolean>(false);
  const [selectedCampagne, setSelectedCampagne] = useState<DraftCampagneDataProps | null>(null);
  const campagneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { filters, setFilters } = useCampagneFilters<CampagneGeneriqueFilters>(() => {}, {});

  const { toggleArchivageCampagne, isToggleArchivagePending } = useCampagneForm(
    selectedCampagne || {
      generic: true,
      isProgrammationActive: false,
    },
    (campagneId) => {
      if (campagneId) {
        setKeepOpenCampagneIds((prev) => new Set([...prev, campagneId]));
      }
      setSelectedCampagne(null);
    },
  );

  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredCampagnes,
  } = useSearchTerm<CampagneDataProps>(campagnes as CampagneDataProps[], (campagne) => campagne.nom, { sortBy: "createdAt" });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetId = searchParams.get("id");

  const isNouvelleCampagneDisabled = useMemo(() => {
    return campagnes.some((campagne) => campagne.id === undefined);
  }, [campagnes]);

  useEffect(() => {
    if (targetId) {
      setOpenCampagneId(targetId);
    }
  }, [targetId]);

  useEffect(() => {
    if (targetId && campagnes.length > 0) {
      const element = campagneRefs.current[targetId];
      if (element) {
        const yOffset = -50;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [targetId, campagnes]);

  const { listesDiffusion, isLoading: isLoadingListesDiffusion } = useListeDiffusion();

  const handleFiltersChange = (newFilters: CampagneGeneriqueFilters) => {
    setFilters(newFilters);
  };

  const { data: campagnesData, refetch: refetchCampagnes } = useQuery({
    queryKey: ["get-campagnes", filters],
    queryFn: async () => {
      return await PlanMarketingService.search({
        generic: true,
        isArchived: filters.isArchived,
        isProgrammationActive: filters.isProgrammationActive,
      });
    },
    enabled: !isLoadingListesDiffusion,
    refetchOnWindowFocus: false,
  });

  const listeDiffusionOptions = useMemo(() => {
    return listesDiffusion.map((liste) => ({
      value: liste.id,
      label: liste.nom + (liste.isArchived ? " (Archivée)" : ""),
      disabled: liste.isArchived,
    }));
  }, [listesDiffusion]);

  useEffect(() => {
    if (campagnesData) {
      setCampagnes((campagnesData as CampagneDataProps[]) ?? []);
    }
  }, [campagnesData]);

  const createNewCampagne = () => {
    const newCampagne: DraftCampagneDataProps = {
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      generic: true,
      isProgrammationActive: false,
      isArchived: false,
    };
    setCampagnes((prev) => [newCampagne, ...prev]);
  };

  const handleDuplicate = (campagneData: CampagneDataProps) => {
    const { id, ...campagneWithoutId } = campagneData;
    const newCampagne: DraftCampagneDataProps = {
      ...campagneWithoutId,
      nom: "",
      isArchived: false,
    };
    setCampagnes((prev) => [newCampagne, ...prev]);
  };

  const handleToggleArchivageCampagne = (campagne: DraftCampagneDataProps) => {
    setSelectedCampagne(campagne);
    setIsArchiveToggleModalOpen(true);
  };

  const confirmToggleArchivage = () => {
    if (selectedCampagne && selectedCampagne.id) {
      toggleArchivageCampagne(selectedCampagne.id);
      setIsArchiveToggleModalOpen(false);
    }
  };

  const refCallbacks = useMemo(() => {
    return filteredCampagnes.reduce(
      (acc, campagne) => {
        if (campagne.id) {
          acc[campagne.id as string] = (el: HTMLDivElement | null) => {
            campagneRefs.current[campagne.id as string] = el;
          };
        }
        return acc;
      },
      {} as Record<string, (el: HTMLDivElement | null) => void>,
    );
  }, [filteredCampagnes]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold leading-7 text-gray-900">Campagnes Génériques</div>
          </div>
          <div className="flex items-center gap-4">
            <CampagneFilters<CampagneGeneriqueFilters> filters={filters} onChange={handleFiltersChange} isSpecificCampaign={false} />
            <InputText value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher" className="w-[200px]" name="search" />
            <ButtonPrimary disabled={isNouvelleCampagneDisabled} onClick={createNewCampagne} className="h-[50px] w-[300px]">
              Nouvelle campagne
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {filteredCampagnes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune campagne trouvée</div>
        ) : (
          filteredCampagnes.map((campagne) => (
            <div key={`campagne-${campagne.id || Math.random()}`} ref={campagne.id ? refCallbacks[campagne.id] : null}>
              <CampagneForm
                campagneData={campagne}
                isDupliquerCampagneDisabled={isNouvelleCampagneDisabled}
                listeDiffusionOptions={listeDiffusionOptions}
                onSave={(campagneId) => {
                  if (campagneId) {
                    setKeepOpenCampagneIds((prev) => new Set([...prev, campagneId]));
                  }
                  refetchCampagnes();
                }}
                onDuplicate={(campagneData) => handleDuplicate(campagneData)}
                forceOpen={campagne.id === openCampagneId || (campagne.id ? keepOpenCampagneIds.has(campagne.id) : false)}
                onToggleArchive={handleToggleArchivageCampagne}
              />
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isArchiveToggleModalOpen}
        onClose={() => setIsArchiveToggleModalOpen(false)}
        className="md:max-w-[600px] text-center"
        header={
          <div className="text-center">
            <HiOutlineExclamation className="bg-gray-100 rounded-full p-2 text-gray-900 mx-auto mb-2" size={48} />
            <h3 className="text-xl font-medium">{selectedCampagne?.isArchived ? "Désarchivage de la campagne générique" : "Archivage de la campagne générique"}</h3>
          </div>
        }
        content={
          <div className="text-gray-700">
            {selectedCampagne?.isArchived ? (
              <div>
                <p>La campagne générique sera désarchivée, mais la programmation restera désactivée.</p>
                <p>Les programmations des campagnes spécifiques resteront désactivées.</p>
              </div>
            ) : (
              <div>
                <p>La campagne générique sera archivée et la programmation sera désactivée.</p>
                <p>Les campagnes spécifiques ne seront pas archivées, mais leurs programmations seront désactivées.</p>
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
