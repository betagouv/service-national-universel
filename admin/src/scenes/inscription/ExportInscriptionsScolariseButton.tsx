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
import { HiDownload } from "react-icons/hi";
import { ExportComponent } from "@/components/filters-system-v2";
import { transformInscription } from "../volontaires/utils";

interface Props {
  user: UserDto;
  selectedFilters: { [key: string]: Filter };
  isAsync?: boolean;
  disabled?: boolean;
}

export default function ExportInscriptionsScolariseButton({ user, selectedFilters, isAsync, disabled }: Props) {
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
      toastr.success("Export des inscriptions", "L'export des inscriptions est en cours de traitement, vous recevrez un email lorsque cela sera terminé.");
      setShowModal(false);
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors de l'export des inscriptions", translate(error.message));
    },
  });

  return (
    <>
      {isAsync && (
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
            title="Exporter les données"
            message={`\nVous allez recevoir un mail pour télécharger votre export. Pensez à regarder dans vos courriers indésirables.\n
          En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL).`}
            onCancel={() => setShowModal(false)}
            onConfirm={() => {
              exportInscriptions();
              setShowModal(false);
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
      )}
      {!isAsync && (
        <ExportComponent
          title={user.role === ROLES.REFERENT_DEPARTMENT ? "Exporter les volontaires scolarisés dans le département" : "Exporter les volontaires scolarisés dans la région"}
          exportTitle="Volontaires"
          route="/elasticsearch/young/young-having-school-in-dep-or-region/export"
          selectedFilters={selectedFilters}
          setIsOpen={() => true}
          icon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
          customCss={{
            override: true,
            button: `group flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
            loadingButton: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
          }}
          transform={async (data) => transformInscription(data)}
        />
      )}
    </>
  );
}
