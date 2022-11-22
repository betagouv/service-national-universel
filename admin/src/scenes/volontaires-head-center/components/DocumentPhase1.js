import React, { useEffect, useState } from "react";
import FileIcon from "../../../assets/FileIcon";

export default function DocumentPhase1(props) {
  const young = props.young;
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState();
  const medicalFileOptions = [
    { value: "RECEIVED", label: "Réceptionné" },
    { value: "TO_DOWNLOAD", label: "Non téléchargé" },
    { value: "DOWNLOADED", label: "Téléchargé" },
  ];

  useEffect(() => {
    if (young) {
      if (young.cohesionStayMedicalFileReceived !== "true") {
        if (young.cohesionStayMedicalFileDownload === "false") {
          setStatusCohesionStayMedical("TO_DOWNLOAD");
        } else {
          setStatusCohesionStayMedical("DOWNLOADED");
        }
      } else {
        setStatusCohesionStayMedical("RECEIVED");
      }
    }
  }, [young]);

  return (
    <>
      <article className="flex items-start justify-between flex-wrap">
        <div className="flex flex-col justify-center items-center">
          <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
            <div className="flex row justify-center mx-2 mb-3">
              <select disabled className="form-control text-sm" value={statusCohesionStayMedical} name="cohesionStayMedical">
                {medicalFileOptions.map((o) => (
                  <option key={o.label} data-color="green" value={o.value} label={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FileIcon icon="sanitaire" filled={young.cohesionStayMedicalFileDownload === "true"} />
            <p className="text-base font-bold mt-2">Fiche sanitaire</p>
          </section>
        </div>
      </article>
    </>
  );
}
