import React, { useState } from "react";
import { Button, Modal } from "@snu/ds/admin";
import { useForm } from "react-hook-form";
import PlanMarketingService from "@/services/planMarketingService";
import { CampagneResponse } from "snu-lib/src/routes/planMarketing";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { CohortType } from "snu-lib";
import { RiDownload2Line } from "react-icons/ri";
import { RiSearchLine } from "react-icons/ri";

interface ModalImportCampagnBrevoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BrevoListData) => void;
  cohort: CohortType;
  isLoadingProcess: boolean;
}

export interface BrevoListData {
  name: string;
  campaignId: string[];
}

export const ModalImportCampagnBrevo = ({ isOpen, onClose, onConfirm, cohort, isLoadingProcess }: ModalImportCampagnBrevoProps) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [importAll, setImportAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { handleSubmit, reset } = useForm<BrevoListData>({
    defaultValues: {
      name: "",
      campaignId: [],
    },
  });

  const {
    mutate: fetchCampagnes,
    data: allCampagnesData = [],
    isPending: isLoadingCampagnes,
  } = useMutation<CampagneResponse[], Error>({
    mutationFn: async () => {
      return await PlanMarketingService.getAll();
    },
    onError: (error) => {
      capture(error);
      toastr.error("Erreur", "Impossible de récupérer les campagnes");
    },
  });

  if (isOpen && !allCampagnesData.length && !isLoadingCampagnes) {
    fetchCampagnes();
  }

  const filteredCampaigns = allCampagnesData
    .filter((campagne) => campagne.type === "BOTH" || campagne.type === cohort.type)
    .filter((campagne) => campagne.nom.toLowerCase().includes(searchTerm.toLowerCase()));

  const onSubmitForm = handleSubmit((data) => {
    const selectedCampaignsData = importAll ? filteredCampaigns : allCampagnesData.filter((campagne) => selectedCampaigns.includes(campagne.id));
    onConfirm({ ...data, campaignId: selectedCampaignsData.map((campagne) => campagne.id) });
    handleOnClose();
  });
  const handleOnClose = () => {
    reset();
    setSelectedCampaigns([]);
    setImportAll(false);
    setSearchTerm("");
    onClose();
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedCampaigns(checked ? filteredCampaigns.map((campagne) => campagne.id) : []);
  };

  const toggleSelectCampaign = (campaignId: string, checked: boolean) => {
    setSelectedCampaigns((prev) => {
      if (checked) {
        return [...prev, campaignId];
      } else {
        return prev.filter((id) => id !== campaignId);
      }
    });
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
          <div className="flex gap-4 justify-center">
            <label>
              <input type="radio" name="importOption" value="select" onChange={() => setImportAll(false)} checked={!importAll} />
              <span className="ml-2 text-sm font-medium">Sélectionner des campagnes</span>
            </label>
            <label>
              <input type="radio" name="importOption" value="all" onChange={() => setImportAll(true)} checked={importAll} />
              <span className="ml-2 text-sm font-medium">Tout importer</span>
            </label>
          </div>
          <hr className="my-4" />

          {!importAll && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-normal">{filteredCampaigns.length} campagnes trouvées</span>
                <div className="flex items-center border p-2 text-sm rounded relative">
                  <RiSearchLine className="text-gray-500 text-lg mr-2" />
                  <input type="text" placeholder="Rechercher..." className="flex-1 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                  />
                  <span className="text-sm font-bold">Tout sélectionner</span>
                </div>
                {filteredCampaigns.map((campagne) => (
                  <div key={campagne.id} className="flex items-center gap-2">
                    <input type="checkbox" onChange={(e) => toggleSelectCampaign(campagne.id, e.target.checked)} checked={selectedCampaigns.includes(campagne.id)} />
                    <span className="text-sm">{campagne.nom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      }
      footer={
        <div className="flex justify-between gap-6">
          <Button title="Annuler" type="secondary" className="flex-1" onClick={handleOnClose} disabled={isLoadingProcess} />
          <Button
            title={`Importer ${importAll ? filteredCampaigns.length : selectedCampaigns.length} campagnes`}
            onClick={onSubmitForm}
            className="flex-1"
            loading={isLoadingProcess}
          />
        </div>
      }
    />
  );
};
