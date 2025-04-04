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

  const setState = (key, value) => {
    switch (key) {
      case "cohesionStayMedical":
        setStatusCohesionStayMedical(value);
        break;
    }
  };

  const needModal = (value, name) => {
    setLoading(true);
    setState(name, value);
    handleChange({ value, name });
  };

  const handleChange = async ({ value, name }) => {
    let params = {};
    try {
      if (name !== "cohesionStayMedical") throw new Error("name not possible : " + name);
      params = medicalFileValue[value];

      const { code, ok } = await api.put(`/referent/young/${young._id}/phase1Status/${name}`, params);
      if (!ok) throw new Error(translate(code));
      toastr.success("Statut mis à jour !");
      updateYoung();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des statuts : ", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container title="Documents">
      <div className="flex bg-gray-50 gap-2 px-6 py-4 items-center w-1/2">
        <div className="flex items-center w-1/2">
          <FileIcon icon="sanitaire" filled={young.cohesionStayMedicalFileDownload === "true"} />
          <p className="mt-2 text-base font-bold">Fiche sanitaire</p>
        </div>
        <div className="flex flex-col gap-2 w-1/2">
          <Select
            name="cohesionStayMedical"
            type="select"
            setSelected={({ value }) => {
              needModal(value, "cohesionStayMedical");
            }}
            selected={statusCohesionStayMedical}
            options={medicalFileOptions}
          />

          {statusCohesionStayMedical === "TO_DOWNLOAD" && (
            <ButtonPrimary disabled={loading} onClick={() => handleEmailClick("cohesionStayMedical")}>
              Relancer le volontaire
            </ButtonPrimary>
          )}
        </div>
      </div>
    </Container>
  );
}
