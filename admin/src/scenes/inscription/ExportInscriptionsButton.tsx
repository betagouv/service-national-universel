import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { translate } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { Filter } from "@/components/filters-system-v2/components/Filters";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { BsDownload } from "react-icons/bs";
import { InscriptionService } from "@/services/inscriptionService";
import { MAX_EXPORT_VOLONTAIRES } from "../volontaires/list";

interface Props {
  selectedFilters: { [key: string]: Filter };
  disabled?: boolean;
}

export default function ExportInscriptionsButton({ selectedFilters, disabled }: Props) {
  const [showModal, setShowModal] = useState(false);

  const { mutate: exportInscriptions, isPending } = useMutation({
    mutationFn: async () => {
      return await InscriptionService.postInscriptionsExport({
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
        fields: ["*"],
        searchTerm: selectedFilters?.searchbar?.filter?.[0],
      });
    },
    onSuccess: () => {
      toastr.success("Export des inscriptions", "L'export des inscriptions est en cours de traitement, vous recevrez un email lorsque cela sera terminé.");
      setShowModal(false);
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors de l'export des inscriptions", translate(error.message));
    },
  });

  return (
    <>
      <Button
        disabled={disabled}
        tooltip={disabled ? `Vous ne pouvez pas exporter plus de ${MAX_EXPORT_VOLONTAIRES} inscriptions à la fois.` : undefined}
        title="Exporter les inscriptions"
        leftIcon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
        loading={isPending}
        className="w-full"
        onClick={() => setShowModal(true)}
      />
      <ModalConfirm
        isOpen={showModal}
        title="Téléchargement"
        message={`\nL'export du fichier volumineux peut prendre du temps. Vous recevrez une notification par e-mail une fois prête.\n
          En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)`}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          exportInscriptions();
          setShowModal(false);
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
