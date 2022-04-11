import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";
import { Formik } from "formik";

import { FILE_STATUS_PHASE1, translateFileStatusPhase1, translate } from "../../../utils";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";

export default function DocumentPhase1(props) {
  const [young, setYoung] = useState(props.young);
  const [statusCohesionStayMedical, setStatusCohesionStayMedical] = useState();
  const [statusAutoTestPCR, setStatusAutoTestPCR] = useState();
  const [statusImageRight, setStatusImageRight] = useState();
  const [statusRules, setStatusRules] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(false);
  const [dataImageRight, setDataImageRight] = useState();
  const [dataAutoTestPCR, setDataAutoTestPCR] = useState();
  const [dataRules, setDataRules] = useState();
  const options = [FILE_STATUS_PHASE1.TO_UPLOAD, FILE_STATUS_PHASE1.WAITING_VERIFICATION, FILE_STATUS_PHASE1.WAITING_CORRECTION, FILE_STATUS_PHASE1.VALIDATED];
  const medicalFileOptions = [
    { value: "RECIEVED", label: "Réceptionné" },
    { value: "TO_DOWNLOAD", label: "Non téléchargé" },
    { value: "DOWNLOADED", label: "Téléchargé" },
  ];

  const medicalFileValue = {
    RECIEVED: { cohesionStayMedicalFileReceived: "true", cohesionStayMedicalFileDownload: "true" },
    TO_DOWNLOAD: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "false" },
    DOWNLOADED: { cohesionStayMedicalFileReceived: "false", cohesionStayMedicalFileDownload: "true" },
  };

  const FILE_TRANSLATION = {
    autoTestPCR: "utilisation d'autotest",
    imageRight: "droit a l'image",
    rules: "règlement interieur",
  };

  const updateYoung = async () => {
    const { data } = await api.get(`/referent/young/${young._id}`);
    if (data) setYoung(data);
    setLoading(false);
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
        setStatusCohesionStayMedical("RECIEVED");
      }
      setStatusAutoTestPCR(young.autoTestPCRFilesStatus);
      setStatusImageRight(young.imageRightFilesStatus);
      setStatusRules(young.rulesFilesStatus);
      setDataImageRight({
        imageRight: young.imageRight,
        imageRightFiles: young.imageRightFiles,
      });
      setDataAutoTestPCR({
        autoTestPCR: young.autoTestPCR,
        autoTestPCRFiles: young.autoTestPCRFiles,
      });
      setDataRules({
        rulesYoung: young.rulesYoung,
        rulesParent1: young.rulesParent1,
        rulesParent2: young.rulesParent2,
        rulesFiles: young.rulesFiles,
      });
    }
  }, [young]);

  const setState = (key, value) => {
    switch (key) {
      case "cohesionStayMedical":
        setStatusCohesionStayMedical(value);
        break;
      case "autoTestPCR":
        setStatusAutoTestPCR(value);
        break;
      case "imageRight":
        setStatusImageRight(value);
        break;
      case "rules":
        setStatusRules(value);
        break;
    }
  };

  const needModal = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setLoading(true);

    if (value === FILE_STATUS_PHASE1.WAITING_CORRECTION) {
      setModal({
        isOpen: true,
        onConfirm: (correctionMessage) => {
          setState(name, value);
          handleChange({ value, name, correctionMessage });
        },
        title: `Vous êtes sur le point de demander la correction du document ${FILE_TRANSLATION[name]}`,
        message: `Car celui n’est pas conforme. Merci de préciser ci-dessous les corrections à apporter. 
        Une fois le message validé, il sera transmis par mail à ${young.firstName} ${young.lastName} (${young.email}).`,
      });
    } else {
      setState(name, value);
      handleChange({ value, name });
    }
  };

  const handleChange = async ({ value, name, correctionMessage = null }) => {
    let params = {};

    if (["autoTestPCR", "imageRight", "rules"].includes(name)) {
      params[`${name}FilesStatus`] = value;
      if (value === FILE_STATUS_PHASE1.WAITING_CORRECTION && correctionMessage) {
        params[`${name}FilesComment`] = correctionMessage;
      }
    } else if (name === "cohesionStayMedical") {
      params = medicalFileValue[value];
    }

    try {
      const { code, ok } = await api.put(`/referent/young/${young._id}/phase1Status/${name}`, params);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la mise a jour des status :", translate(code));
      toastr.success("Statut mis à jour!");
      updateYoung();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des status :", translate(e.code));
    }
  };

  if (!dataImageRight && !dataAutoTestPCR && !dataRules) return null;

  return (
    <Row>
      <Col md={6} style={{ borderRight: "2px solid #f4f5f7", borderBottom: "2px solid #f4f5f7" }}>
        <div className="flex row justify-center mx-2 my-1">
          <h1 className="text-center pb-2">Fiche Sanitaire</h1>
          <select disabled={loading} className="form-control" value={statusCohesionStayMedical} name="cohesionStayMedical" onChange={(e) => needModal(e)}>
            {medicalFileOptions.map((o, i) => (
              <option key={i} value={o.value} label={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </Col>
      <Col md={6} style={{ borderBottom: "2px solid #f4f5f7" }}>
        <div className="flex row justify-center mx-2 my-1">
          <h1 className="text-center pb-2">Droit a l'image</h1>

          <select disabled={loading} className="form-control" value={statusImageRight} name="imageRight" onChange={(e) => needModal(e)}>
            {options.map((o, i) => (
              <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                {translateFileStatusPhase1(o)}
              </option>
            ))}
          </select>
          {young.imageRightFilesComment && <p>Commentaire : {young.imageRightFilesComment}</p>}

          <Formik
            initialValues={dataImageRight}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async (values) => {
              try {
                const { ok, code } = await api.put(`/referent/young/${young._id}/phase1Files/imageRight`, values);
                if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
                toastr.success("Mis à jour!");
                updateYoung();
              } catch (e) {
                console.log(e);
                toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
              }
            }}>
            {({ values, handleChange, handleSubmit }) => (
              <>
                <div className="flex flex-col p-2">
                  <Select
                    placeholder="Non renseigné"
                    name="imageRight"
                    values={values}
                    handleChange={(e) => {
                      handleChange(e), handleSubmit();
                    }}
                    title="Autorisation"
                    options={[
                      { value: "true", label: "Oui" },
                      { value: "false", label: "Non" },
                    ]}
                  />
                  <Documents>
                    <h4>Formulaire de consentement d&apos;autotest PCR</h4>
                    <DndFileInput
                      placeholder="un document justificatif"
                      errorMessage="Vous devez téléverser un document justificatif"
                      value={values.imageRightFiles}
                      source={(e) => api.get(`/referent/youngFile/${young._id}/imageRightFiles/${e}`)}
                      name="imageRightFiles"
                      onChange={async (e) => {
                        const res = await api.uploadFile("/referent/file/imageRightFiles", e.target.files, { youngId: young._id });
                        if (res.code === "FILE_CORRUPTED") {
                          return toastr.error(
                            "Le fichier semble corrompu",
                            "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                            { timeOut: 0 },
                          );
                        }
                        if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                        // We update and save it instant.
                        handleChange({ target: { value: res.data, name: "imageRightFiles" } });
                        handleSubmit();
                      }}
                    />
                  </Documents>
                </div>
              </>
            )}
          </Formik>
        </div>
      </Col>
      <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
        <div className="flex row justify-center mx-2 my-1">
          <h1 className="text-center pb-2">Utilisation d'autotest</h1>
          <select disabled={loading} className="form-control" value={statusAutoTestPCR} name="autoTestPCR" onChange={(e) => needModal(e)}>
            {options.map((o, i) => (
              <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                {translateFileStatusPhase1(o)}
              </option>
            ))}
          </select>
          {young.autoTestPCRFilesComment && <p>Commentaire : {young.autoTestPCRFilesComment}</p>}
          <Formik
            initialValues={dataAutoTestPCR}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async (values) => {
              try {
                const { ok, code } = await api.put(`/referent/young/${young._id}/phase1Files/autoTestPCR`, values);
                if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
                toastr.success("Mis à jour!");
                updateYoung();
              } catch (e) {
                console.log(e);
                toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
              }
            }}>
            {({ values, handleChange, handleSubmit }) => (
              <>
                <div className="flex flex-col p-2">
                  <Select
                    placeholder="Non renseigné"
                    name="autoTestPCR"
                    values={values}
                    handleChange={(e) => {
                      handleChange(e), handleSubmit();
                    }}
                    title="Autorisation"
                    options={[
                      { value: "true", label: "Oui" },
                      { value: "false", label: "Non" },
                    ]}
                  />
                  <Documents>
                    <h4>Formulaire de consentement d&apos;autotest PCR</h4>
                    <DndFileInput
                      placeholder="un document justificatif"
                      errorMessage="Vous devez téléverser un document justificatif"
                      value={values.autoTestPCRFiles}
                      source={(e) => api.get(`/referent/youngFile/${young._id}/autoTestPCRFiles/${e}`)}
                      name="autoTestPCRFiles"
                      onChange={async (e) => {
                        const res = await api.uploadFile("/referent/file/autoTestPCRFiles", e.target.files, { youngId: young._id });
                        if (res.code === "FILE_CORRUPTED") {
                          return toastr.error(
                            "Le fichier semble corrompu",
                            "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                            { timeOut: 0 },
                          );
                        }
                        if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                        // We update and save it instant.
                        handleChange({ target: { value: res.data, name: "autoTestPCRFiles" } });
                        handleSubmit();
                      }}
                    />
                  </Documents>
                </div>
              </>
            )}
          </Formik>
        </div>
      </Col>
      <Col md={6}>
        <div className="flex row justify-center mx-2 my-1">
          <h1 className="text-center pb-2">Règlement interieur</h1>
          <select disabled={loading} className="form-control" value={statusRules} name="rules" onChange={(e) => needModal(e)}>
            {options.map((o, i) => (
              <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                {translateFileStatusPhase1(o)}
              </option>
            ))}
          </select>
          {young.rulesFilesComment && <p>Commentaire : {young.rulesFilesComment}</p>}
          <Formik
            initialValues={dataRules}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async (values) => {
              try {
                const { ok, code } = await api.put(`/referent/young/${young._id}/phase1Files/rules`, values);
                if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
                toastr.success("Mis à jour!");
                updateYoung();
              } catch (e) {
                console.log(e);
                toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
              }
            }}>
            {({ values, handleChange, handleSubmit }) => (
              <>
                <div className="flex flex-col p-2">
                  <Documents>
                    <h4>Document règlement intérieur</h4>
                    <DndFileInput
                      placeholder="un document justificatif"
                      errorMessage="Vous devez téléverser un document justificatif"
                      value={values.rulesFiles}
                      source={(e) => api.get(`/referent/youngFile/${young._id}/rulesFiles/${e}`)}
                      name="rulesFiles"
                      onChange={async (e) => {
                        const res = await api.uploadFile("/referent/file/rulesFiles", e.target.files, { youngId: young._id });
                        if (res.code === "FILE_CORRUPTED") {
                          return toastr.error(
                            "Le fichier semble corrompu",
                            "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                            { timeOut: 0 },
                          );
                        }
                        if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                        // We update and save it instant.
                        handleChange({ target: { value: res.data, name: "rulesFiles" } });
                        handleSubmit();
                      }}
                    />
                  </Documents>
                </div>
              </>
            )}
          </Formik>
        </div>
      </Col>
      <ModalConfirmWithMessage
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onChange={() => {
          setModal({ isOpen: false, onConfirm: null }), setLoading(false);
        }}
        onConfirm={(message) => {
          modal?.onConfirm(message);
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </Row>
  );
}
