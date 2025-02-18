import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { Button, Tooltip } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import { DepartmentService } from "@/services/departmentService";
import { translate } from "snu-lib";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { downloadFileFrombase64 } from "@/services/file.service";
interface ContactSimulationProps {
  session: CohortDto;
}

export default function ExportContactConvocation({ session }: ContactSimulationProps) {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => DepartmentService.exportContacts({ sessionId: session._id! }),
    onSuccess: ({ base64, mimeType, fileName }) => {
      try {
        downloadFileFrombase64(base64, fileName, mimeType);
        toastr.success("Succès", "Fichier importé avec succès");
      } catch (error) {
        capture(error);
        toastr.error("Erreur", "Le fichier n'a pas pu être décodé correctement", { timeOut: 5000 });
      }
    },
    onError: (error: any) => {
      capture(error);
      toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message), { timeOut: 5000 });
    },
  });

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Export des contacts de convocation</div>
        <Tooltip id="export-contact-convocation" title="Récupérer la liste des emails de contacts manquants">
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isPending && <div className="text-xs leading-4 font-normal text-orange-500 italic">Téléchargement en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button title="Exporter les contacts" onClick={() => mutate()} loading={isPending} disabled={isPending} />
      </div>
    </div>
  );
}
