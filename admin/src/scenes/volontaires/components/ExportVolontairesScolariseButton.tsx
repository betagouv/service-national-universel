import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { ROLES, translate, UserDto } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { Filter } from "@/components/filters-system-v2/components/Filters";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { BsDownload } from "react-icons/bs";
import { JeuneService } from "@/services/jeuneService";
import { buildApiv2Query } from "@/components/filters-system-v2/components/filters/utils";
import { MAX_EXPORT_VOLONTAIRES } from "../list";

interface Props {
  user: UserDto;
  selectedFilters: { [key: string]: Filter };
  disabled?: boolean;
}

export default function ExportVolontairesScolariseButton({ user, selectedFilters, disabled }: Props) {
  const [showModal, setShowModal] = useState(false);

  const { mutate: exportJeunesScolarise, isPending } = useMutation({
    mutationFn: async () => await JeuneService.postJeunesScolariseExport(buildApiv2Query(selectedFilters, ["*"])),
    onSuccess: () => {
      toastr.success(
        "Exportation des volontaires scolarisés",
        "L'exportation des volontaires scolarisés a en cours de traitement, vous recevrez un email lorsque cela sera terminé.",
      );
      setShowModal(false);
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors de l'exportation des volontaires scolarisés", translate(error.message));
    },
  });

  return (
    <>
      <Button
        disabled={disabled}
        tooltip={disabled ? `Vous ne pouvez pas exporter plus de ${MAX_EXPORT_VOLONTAIRES} volontaires à la fois.` : undefined}
        title={user.role === ROLES.REFERENT_DEPARTMENT ? "Exporter les volontaires scolarisés dans le département" : "Exporter les volontaires scolarisés dans la région"}
        leftIcon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
        loading={isPending}
        onClick={() => setShowModal(true)}
      />
      <ModalConfirm
        isOpen={showModal}
        title="Téléchargement"
        message={`\nL'exportation du fichier volumineux peut prendre du temps. Vous recevrez une notification par e-mail une fois prête.\n
          En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)`}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          exportJeunesScolarise();
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
