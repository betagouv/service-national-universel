import React, { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { Button, Tooltip } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import API from "@/services/api";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

interface ContactSimulationProps {
  session: CohortDto;
}

export default function ExportContactConvocation({ session }: ContactSimulationProps) {
  const [isInProgress, setIsInProgress] = useState(false);

  const handleExport = async () => {
    setIsInProgress(true);
    try {
      const data = await API.get(`/department-service-goal/${session._id}/DepartmentServiceContact/export`);

      const { resultSansContact, resultAvecContact, cohortName } = data;

      const workbook = XLSX.utils.book_new();
      const worksheetSansContact = XLSX.utils.json_to_sheet(resultSansContact);
      const worksheetAvecContact = XLSX.utils.json_to_sheet(resultAvecContact);

      XLSX.utils.book_append_sheet(workbook, worksheetSansContact, "Sans Contact");
      XLSX.utils.book_append_sheet(workbook, worksheetAvecContact, "Avec Contact");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      FileSaver.saveAs(blob, `${cohortName}_export_MissingContact.xlsx`);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
    } finally {
      setIsInProgress(false);
    }
  };

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
        <Button title="Exporter les contacts" onClick={handleExport} loading={isInProgress} disabled={isInProgress} />
      </div>
    </div>
  );
}
