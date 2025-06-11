import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, InputText, InputCheckbox } from "@snu/ds/admin";
import { useForm } from "react-hook-form";
import PlanMarketingService from "@/services/planMarketingService";
import { useQuery } from "@tanstack/react-query";
import { CohortDto } from "snu-lib";
import { RiDownload2Line, RiSearchLine } from "react-icons/ri";
import { CampagneDataProps } from "../../scenes/planMarketing/campagne/CampagneForm";
import { CampagneSpecifiqueFormData } from "@/scenes/planMarketing/campagne/CampagneSpecifiqueForm";

interface ModalImportCampagneBrevoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CampagneSpecificData) => void;
  cohort: CohortDto;
  campagnesSpecifiques: CampagneSpecifiqueFormData[];
}

export interface CampagneSpecificData {
  campagneGeneriqueId: string[];
}

export const ModalImportCampagneBrevo = ({ isOpen, onClose, onConfirm, cohort, campagnesSpecifiques: campagneSpecific }: ModalImportCampagneBrevoProps) => {
  const [campagnes, setCampagnes] = useState<CampagneDataProps[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { handleSubmit, reset } = useForm<CampagneSpecificData>({
    defaultValues: { campagneGeneriqueId: [] },
  });

  const isCampaignDisabled = useCallback((campagneId: string): boolean => campagneSpecific.some((campSpec) => campSpec.campagneGeneriqueId === campagneId), [campagneSpecific]);

  const { data: campagnesData } = useQuery({
    queryKey: ["get-campagnes"],
    queryFn: async () => await PlanMarketingService.search({ generic: true }),
  });

  useEffect(() => {
    setCampagnes((campagnesData as CampagneDataProps[]) ?? []);
  }, [campagnesData]);

  const filteredCampaigns = useMemo(() => {
    return campagnes
      .filter((campagne) => campagne.type === "BOTH" || campagne.type === cohort.type)
      .filter((campagne) => campagne.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [campagnes, cohort.type, searchTerm]);

  const onSubmitForm = handleSubmit((formValues) => {
    const selectedCampaignsData = campagnes.filter((campagne) => selectedCampaigns.includes(campagne.id));
    onConfirm({
      ...formValues,
      campagneGeneriqueId: selectedCampaignsData.map((campagne) => campagne.id),
    });
    handleOnClose();
  });

  const handleOnClose = () => {
    reset();
    setSelectedCampaigns([]);
    setSearchTerm("");
    onClose();
  };

  const allSelectableCampaigns = useMemo(() => {
    return filteredCampaigns.filter((campagne) => !isCampaignDisabled(campagne.id));
  }, [filteredCampaigns, isCampaignDisabled]);

  const selectableCampaignsNonArchived = useMemo(() => {
    return allSelectableCampaigns.filter((campagne) => !campagne.isArchived);
  }, [allSelectableCampaigns]);

  const toggleSelectAll = (checked: boolean) => {
    setSelectedCampaigns(checked ? selectableCampaignsNonArchived.map((campagne) => campagne.id) : []);
  };

  const toggleSelectCampaign = (campaignId: string, checked: boolean) => {
    setSelectedCampaigns((prev) => (checked ? [...prev, campaignId] : prev.filter((id) => id !== campaignId)));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleOnClose}
      className="md:max-w-[600px]"
      content={
        <form onSubmit={onSubmitForm} className="overflow-y-auto max-h-[80vh]">
          <div className="flex justify-center mb-2">
            <div className="bg-gray-200 p-3 rounded-full cursor-pointer">
              <RiDownload2Line className="text-gray-600 text-xl" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-xl font-medium">Importer les campagnes</h1>
          </div>
          <hr className="my-4" />
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-normal">{filteredCampaigns.length} campagnes trouvées</span>
              <InputText
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="flex mr-1"
                icon={<RiSearchLine className="text-gray-500 text-lg mr-2" />}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <InputCheckbox
                  name="selectAll"
                  checked={selectedCampaigns.length === selectableCampaignsNonArchived.length && selectableCampaignsNonArchived.length > 0}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  label="Tout sélectionner"
                />
              </div>
              {filteredCampaigns.map((campagne) => {
                const disabled = isCampaignDisabled(campagne.id);
                return (
                  <div className="flex justify-between items-center gap-4" key={campagne.id}>
                    <InputCheckbox
                      name={`checkbox-${campagne.id}`}
                      checked={selectedCampaigns.includes(campagne.id)}
                      onChange={(e) => toggleSelectCampaign(campagne.id, e.target.checked)}
                      disabled={disabled || campagne.isArchived}
                      label={campagne.nom}
                    />
                    {disabled && (
                      <div>
                        <span className="text-sm font-normal text-gray-400">Déjà importée</span>
                      </div>
                    )}
                    {campagne.isArchived && (
                      <div>
                        <span className="text-sm font-normal text-gray-400">Archivée</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      }
      footer={
        <div className="flex justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1" onClick={handleOnClose} />
          <Button title={`Importer ${selectedCampaigns.length} campagne${selectedCampaigns.length > 1 ? "s" : ""}`} onClick={onSubmitForm} className="flex-1" />
        </div>
      }
    />
  );
};
