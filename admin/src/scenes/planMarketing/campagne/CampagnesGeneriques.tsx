import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlanMarketingService from "@/services/planMarketingService";
import { InputText } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState, useRef } from "react";
import CampagneForm, { CampagneDataProps, DraftCampagneDataProps } from "./CampagneForm";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";
import { useLocation } from "react-router-dom";

export default function CampagnesGeneriques() {
  const [campagnes, setCampagnes] = useState<DraftCampagneDataProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCampagneId, setOpenCampagneId] = useState<string | null>(null);
  const campagneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  const { data: campagnesData, refetch } = useQuery({
    queryKey: ["get-campagnes"],
    queryFn: async () => {
      return await PlanMarketingService.search({ generic: true });
    },
  });

  const { listesDiffusion } = useListeDiffusion();

  const listeDiffusionOptions = useMemo(() => {
    return listesDiffusion.map((liste) => ({
      value: liste.id,
      label: liste.nom,
    }));
  }, [listesDiffusion]);

  useEffect(() => {
    setCampagnes((campagnesData as CampagneDataProps[]) ?? []);
  }, [campagnesData]);

  const createNewCampagne = () => {
    const newCampagne: DraftCampagneDataProps = {
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      generic: true,
    };
    setCampagnes((prev) => [newCampagne, ...prev]);
  };

  const handleDuplicate = (campagneData: CampagneDataProps) => {
    const { id, ...campagneWithoutId } = campagneData;
    const newCampagne: DraftCampagneDataProps = {
      ...campagneWithoutId,
      nom: "",
    };
    setCampagnes((prev) => [newCampagne, ...prev]);
  };

  const filteredCampagnes = useMemo(() => {
    return campagnes
      .filter((campagne) => campagne.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || !campagne.nom)
      .sort((a, b) => ((a.createdAt ?? "") > (b.createdAt ?? "") ? 1 : -1));
  }, [campagnes, searchTerm]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Campagnes Génériques</div>
          <div className="flex items-center gap-4">
            <InputText value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher" className="w-[200px]" name="search" />
            <ButtonPrimary disabled={isNouvelleCampagneDisabled} onClick={createNewCampagne} className="h-[50px] w-[300px]">
              Nouvelle campagne
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {filteredCampagnes.map((campagne) => (
          <div key={`campagne-${campagne.id}`} ref={(el) => campagne.id && (campagneRefs.current[campagne.id] = el)}>
            <CampagneForm
              campagneData={campagne}
              isDupliquerCampagneDisabled={isNouvelleCampagneDisabled}
              listeDiffusionOptions={listeDiffusionOptions}
              onSave={refetch}
              onDuplicate={(campagneData) => handleDuplicate(campagneData)}
              forceOpen={campagne.id === openCampagneId}
            />
          </div>
        ))}
      </div>
    </>
  );
}
