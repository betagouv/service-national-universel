import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlanMarketingService from "@/services/planMarketingService";
import { InputText } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import CampagneForm, { CampagneDataProps, DraftCampagneDataProps } from "./CampagneForm";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";

export default function CampagnesGeneriques() {
  const [campagnes, setCampagnes] = useState<DraftCampagneDataProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isNouvelleCampagneDisabled = useMemo(() => {
    return campagnes.some((campagne) => campagne.id === undefined);
  }, [campagnes]);

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
    setCampagnes(campagnesData ?? []);
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
          <CampagneForm
            key={`campagne-${campagne.id}`}
            campagneData={campagne}
            isDupliquerCampagneDisabled={isNouvelleCampagneDisabled}
            listeDiffusionOptions={listeDiffusionOptions}
            onSave={refetch}
            onDuplicate={(campagneData) => handleDuplicate(campagneData)}
          />
        ))}
      </div>
    </>
  );
}
