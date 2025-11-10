import React from "react";
import { Container } from "@snu/ds/admin";
import FileIcon from "../../../../assets/FileIcon";

const getStatusCohesionStayMedical = (young) => {
  if (young?.cohesionStayMedicalFileReceived === "false" && young?.cohesionStayMedicalFileDownload === "false") return "TO_DOWNLOAD";
  if (young?.cohesionStayMedicalFileReceived === "true" && young?.cohesionStayMedicalFileDownload === "true") return "RECEIVED";
  return "DOWNLOADED";
};

export default function DocumentPhase1(props) {
  const statusCohesionStayMedical = getStatusCohesionStayMedical(props.young);
  const medicalFileOptions = [
    { value: "RECEIVED", label: "Réceptionnée" },
    { value: "TO_DOWNLOAD", label: "Non téléchargée" },
    { value: "DOWNLOADED", label: "Téléchargée" },
  ];

  return (
    <Container title="Documents">
      <div className="flex bg-gray-50 gap-2 px-6 py-4 items-center w-1/2">
        <div className="flex items-center w-1/2">
          <FileIcon icon="sanitaire" filled={props.young?.cohesionStayMedicalFileDownload === "true"} />
          <p className="mt-2 text-base font-bold">Fiche sanitaire</p>
        </div>
        <div className="flex flex-col gap-2 w-1/2">
          <div>{medicalFileOptions.find((option) => option.value === statusCohesionStayMedical)?.label}</div>
        </div>
      </div>
    </Container>
  );
}
