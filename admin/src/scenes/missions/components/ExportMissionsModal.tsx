import React, { useState } from "react";

import ModalExportAsync from "@/components/filters-system-v2/components/export/ModalExportAsync";
import { missionExportFields, ROLES, UserDto } from "snu-lib";
import { Filter } from "@/components/filters-system-v2/components/Filters";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { MissionService } from "@/services/missionService";
import ModalConfirm from "@/components/modals/ModalConfirm";

const getExportsFields = (user: UserDto) => {
  if (user.role === ROLES.RESPONSIBLE) {
    return missionExportFields.filter((e) => !e.title.includes("structure"));
  }
  return missionExportFields;
};

interface Props {
  user: UserDto;
  selectedFilters: { [key: string]: Filter };
  onClose: () => void;
  isOpen: boolean;
}

export default function ExportMissionsModal({ user, selectedFilters, onClose, isOpen }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportParams, setExportParams] = useState<{ selectedFilters: { [key: string]: Filter }; selectedFields: string[] } | null>(null);

  const { mutate: exportCandidatures, isPending } = useMutation<any, Error, { selectedFilters: { [key: string]: Filter }; selectedFields: string[] }>({
    mutationFn: async ({ selectedFilters, selectedFields }) => {
      return await MissionService.postMissionsExport({
        filters: Object.entries(selectedFilters).reduce(
          (acc, [key, value]) => {
            if (key === "searchbar") {
              return acc;
            }
            // @ts-ignore
            acc[key] = value.filter;
            return acc;
          },
          {} as Record<string, string | string[]>,
        ),
        fields: selectedFields,
        searchTerm: selectedFilters?.searchbar?.filter?.[0],
      });
    },
    onSuccess: () => {
      toastr.success("Exportation des candidatures", "L'exportation des candidatures a en cours de traitement, vous recevrez un email lorsque cela sera terminé.");
      setExportParams(null);
      onClose();
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors de l'exportation des candidatures", error.message);
    },
  });

  return (
    <>
      <ModalExportAsync
        isOpen={isOpen}
        onClose={onClose}
        exportFields={getExportsFields(user)}
        exportTitle="missions"
        selectedFilters={selectedFilters}
        isLoading={isPending}
        onExport={(filters, fields) => {
          setExportParams({ selectedFilters: filters, selectedFields: fields });
          setShowModal(true);
        }}
      />
      <ModalConfirm
        isOpen={showModal}
        title="Téléchargement"
        message={`\nL'exportation du fichier volumineux peut prendre du temps. Vous recevrez une notification par e-mail une fois prête.\n
          En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)`}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          exportCandidatures(exportParams!);
          setShowModal(false);
          setExportParams(null);
        }}
        onChange={() => {}}
        showHeaderText={true}
        showHeaderIcon={true}
        headerText=""
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </>
  );
}
