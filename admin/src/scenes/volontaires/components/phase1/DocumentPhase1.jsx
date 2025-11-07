import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Container } from "@snu/ds/admin";
import FileIcon from "../../../../assets/FileIcon";
import api from "../../../../services/api";
import { SENDINBLUE_TEMPLATES, translate } from "../../../../utils";
import { capture, captureMessage } from "../../../../sentry";
import Select from "../../../../components/TailwindSelect";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";

const getStatusCohesionStayMedical = (young) => {
  if (young?.cohesionStayMedicalFileReceived === "false" && young?.cohesionStayMedicalFileDownload === "false") return "TO_DOWNLOAD";
  if (young?.cohesionStayMedicalFileReceived === "true" && young?.cohesionStayMedicalFileDownload === "true") return "RECEIVED";
  return "DOWNLOADED";
};

export default function DocumentPhase1(props) {
  const [young, setYoung] = useState(props.young);
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState(getStatusCohesionStayMedical(props.young));
  const [loading, setLoading] = useState(false);
  const medicalFileOptions = [
    { value: "RECEIVED", label: "Réceptionné" },
    { value: "TO_DOWNLOAD", label: "Non téléchargé" },
    { value: "DOWNLOADED", label: "Téléchargé" },
  ];

  const medicalFileValue = {
    RECEIVED: { cohesionStayMedicalFileReceived: "true", cohesionStayMedicalFileDownload: "true" },
    TO_DOWNLOAD: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "false" },
    DOWNLOADED: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "true" },
  };

  const updateYoung = async () => {
    if (!young?.__id) {
      captureMessage("Error with young :", { extra: { young } });
      return;
    }
    const { data } = await api.get(`/referent/young/${young._id}`);
    if (data) setYoung(data);
    const status = getStatusCohesionStayMedical(data);
    setStatusCohesionStayMedical(status);
    setLoading(false);
  };

  const handleEmailClick = async (view) => {
    try {
      setLoading(true);
      let template;
      let body = {};

      if (view !== "cohesionStayMedical") throw new Error("view not possible : " + view);
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_MEDICAL_FILE;

      const { ok } = await api.post(`/young/${young._id}/email/${template}`, body);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la relance du volontaire");
      toastr.success("Relance du volontaire envoyée avec succès");
      setLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoi de la relance :", translate(e.code));
      setLoading(false);
    }
  };

  return <Container title="Documents" />;
};
