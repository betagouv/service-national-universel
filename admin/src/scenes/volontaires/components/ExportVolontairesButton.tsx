import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { useMutation } from "@tanstack/react-query";

import { translate, youngExportFields } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { Filter } from "@/components/filters-system-v2/components/Filters";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { BsDownload } from "react-icons/bs";
import { JeuneService } from "@/services/jeuneService";
import { buildApiv2Query } from "@/components/filters-system-v2/components/filters/utils";
import ModalExportAsync from "@/components/filters-system-v2/components/export/ModalExportAsync";
import { MAX_EXPORT_VOLONTAIRES } from "../list";
import { HiDownload } from "react-icons/hi";

interface Props {
  selectedFilters: { [key: string]: Filter };
  disabled?: boolean;
}

export default function ExportVolontairesButton({ selectedFilters, disabled }: Props) {
  const [showModal, setShowModal] = useState<"field" | "confirm" | null>(null);
  const [exportParams, setExportParams] = useState<{ selectedFilters: { [key: string]: Filter }; selectedFields: string[] } | null>(null);

  const { mutate: exportJeunes, isPending } = useMutation<any, Error, { selectedFilters: { [key: string]: Filter }; selectedFields: string[] }>({
    mutationFn: async ({ selectedFilters, selectedFields }: { selectedFilters: { [key: string]: Filter }; selectedFields: string[] }) =>
      await JeuneService.postJeunesExport(buildApiv2Query(selectedFilters, selectedFields)),
    onSuccess: () => {
      toastr.success("Export des volontaires", "L'export des volontaires est en cours de traitement, vous recevrez un email lorsque cela sera terminé.");
      setExportParams(null);
      setShowModal(null);
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors de l'export des volontaires", translate(error.message));
    },
  });

  return (
    <>
      <Button
        disabled={disabled}
        tooltip={disabled ? `Vous ne pouvez pas exporter plus de ${MAX_EXPORT_VOLONTAIRES} volontaires à la fois.` : undefined}
        title="Exporter"
        leftIcon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
        loading={isPending}
        onClick={() => setShowModal("field")}
      />
      <ModalExportAsync
        isOpen={showModal === "field"}
        onClose={() => setShowModal(null)}
        exportFields={youngExportFields}
        exportTitle="volontaires"
        selectedFilters={selectedFilters}
        isLoading={isPending}
        onExport={(filters, fields) => {
          setExportParams({ selectedFilters: filters, selectedFields: fields });
          setShowModal("confirm");
        }}
      />
      <ModalConfirm
        isOpen={showModal === "confirm"}
        title="Exporter les données"
        message={`\nVous allez recevoir un mail pour télécharger votre export. Pensez à regarder dans vos courriers indésirables.\n
          En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL).`}
        onCancel={() => setShowModal(null)}
        onConfirm={() => {
          exportJeunes(exportParams!);
          setShowModal(null);
          setExportParams(null);
        }}
        onChange={() => {}}
        showHeaderText
        showHeaderIcon
        icon={<HiDownload size={48} className="text-blue-600 bg-blue-100 rounded-full p-2" />}
        headerText=""
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </>
  );
}
