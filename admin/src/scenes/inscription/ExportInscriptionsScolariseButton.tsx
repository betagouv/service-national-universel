import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { ROLES, translate, UserDto } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { Filter } from "@/components/filters-system-v2/components/Filters";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { BsDownload } from "react-icons/bs";
import { InscriptionService } from "@/services/inscriptionService";
import { MAX_EXPORT_VOLONTAIRES } from "../volontaires/list";
import { buildApiv2Query } from "@/components/filters-system-v2/components/filters/utils";

interface Props {
  user: UserDto;
  selectedFilters: { [key: string]: Filter };
  disabled?: boolean;
}

export default function ExportInscriptionsScolariseButton({ user, selectedFilters, disabled }: Props) {
  const [showModal, setShowModal] = useState(false);

  const { mutate: exportInscriptions, isPending } = useMutation({
    mutationFn: async () => {
      return await InscriptionService.postInscriptionsScolariseExport({
        ...buildApiv2Query(selectedFilters, ["*"]),
        departement: user.role === ROLES.REFERENT_DEPARTMENT ? (user.department as string[]) : undefined,
        region: user.role === ROLES.REFERENT_REGION ? user.region : undefined,
      });
    },
    onSuccess: () => {
      toastr.success("Export des inscriptions", "L'export des inscriptions a en cours de traitement, vous recevrez un email lorsque cela sera terminé.");
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
        title={user.role === ROLES.REFERENT_DEPARTMENT ? "Exporter les volontaires scolarisés dans le département" : "Exporter les volontaires scolarisés dans la région"}
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
