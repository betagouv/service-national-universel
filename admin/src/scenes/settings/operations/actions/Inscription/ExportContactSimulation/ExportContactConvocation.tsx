import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { Button, Tooltip } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { DepartmentService } from "@/services/departmentService";
import { DepartmentServiceRoutes } from "snu-lib";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";

interface ContactSimulationProps {
  session: CohortDto;
}

export default function ExportContactConvocation({ session }: ContactSimulationProps) {
  const [isInProgress, setIsInProgress] = useState(false);

  const mutation = useMutation<DepartmentServiceRoutes["ExportContacts"]["params"]>({
    mutationFn: async () => {
      return await DepartmentService.exportContacts({ sessionId: session._id });
    },
    onMutate: () => {
      setIsInProgress(true);
    },
    onSuccess: (data) => {
      const { resultSansContact, resultAvecContact, cohortName } = data;

      const workbook = XLSX.utils.book_new();
      const worksheetSansContact = XLSX.utils.json_to_sheet(resultSansContact);
      const worksheetAvecContact = XLSX.utils.json_to_sheet(resultAvecContact);

      XLSX.utils.book_append_sheet(workbook, worksheetSansContact, "Sans Contact");
      XLSX.utils.book_append_sheet(workbook, worksheetAvecContact, "Avec Contact");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      FileSaver.saveAs(blob, `${cohortName}_export_MissingContact.xlsx`);

      toastr.success("Export réussi", "Le fichier a été téléchargé avec succès", { timeOut: 5000 });
    },
    onError: (error) => {
      console.error("Erreur lors du téléchargement :", error);
      toastr.error("Erreur", "Une erreur est survenue lors du téléchargement", { timeOut: 5000 });
    },
    onSettled: () => {
      setIsInProgress(false);
    },
  });

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Export des contacts de convocation</div>
        <Tooltip id="export-contact-convocation" title="Récupérer la liste des emails de contacts manquants">
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
        {isInProgress && <div className="text-xs leading-4 font-normal text-orange-500 italic">Téléchargement en cours...</div>}
      </div>
      <div className="flex gap-2">
        <Button title="Exporter les contacts" onClick={() => mutation.mutate()} loading={isInProgress} disabled={isInProgress} />
      </div>
    </div>
  );
}
