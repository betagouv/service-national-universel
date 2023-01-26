import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import FileIcon from "../../../assets/FileIcon";
import api from "../../../services/api";
import { SENDINBLUE_TEMPLATES, translate } from "../../../utils";
import ButtonPlain from "./ButtonPlain";
import { capture } from "../../../sentry";
import Select from "../../../components/TailwindSelect";

export default function DocumentPhase1(props) {
  const [young, setYoung] = useState(props.young);
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState();
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
    const { data } = await api.get(`/referent/young/${young._id}`);
    if (data) setYoung(data);
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
    console.log(value, name);
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
    }
  };

  return (
    <>
      <article className="flex items-start justify-between gap-6">
        <div className="flex flex-col justify-center items-center basis-1/4">
          <section className="bg-gray-50 rounded-lg m-2 flex flex-col items-center justify-start p-4 h-[300px] w-full">
            <div className=" mx-2 mb-3 w-full">
              <Select
                name="cohesionStayMedical"
                type="select"
                setSelected={({ value }) => {
                  needModal(value, "cohesionStayMedical");
                }}
                selected={statusCohesionStayMedical}
                options={medicalFileOptions}
              />
            </div>
            <FileIcon icon="sanitaire" filled={young.cohesionStayMedicalFileDownload === "true"} />
            <p className="text-base font-bold mt-2">Fiche sanitaire</p>
          </section>
          {statusCohesionStayMedical === "TO_DOWNLOAD" && (
            <ButtonPlain
              tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
              disabled={loading}
              className="border rounded-lg m-2 px-4 py-2"
              onClick={() => handleEmailClick("cohesionStayMedical")}>
              Relancer le volontaire
            </ButtonPlain>
          )}
        </div>
      </article>
    </>
  );
}
