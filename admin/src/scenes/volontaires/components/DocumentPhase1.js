import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import Select from "../components/Select";
import Documents from "../components/Documents";
import DndFileInput from "../../../components/dndFileInput";
import { Formik } from "formik";
import FileIcon from "../../../assets/FileIcon";

import { FILE_STATUS_PHASE1, translateFileStatusPhase1, translate, SENDINBLUE_TEMPLATES } from "../../../utils";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import { environment } from "../../../config";
import ModalDocument from "./ModalDocument";
import ButtonPlain from "./ButtonPlain";

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
  const [isOpenImg, setIsOpenImg] = useState(false);
  const [isOpenAut, setIsOpenAut] = useState(false);
  const [isOpenReg, setIsOpenReg] = useState(false);
  const options = [FILE_STATUS_PHASE1.TO_UPLOAD, FILE_STATUS_PHASE1.WAITING_VERIFICATION, FILE_STATUS_PHASE1.WAITING_CORRECTION, FILE_STATUS_PHASE1.VALIDATED];
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
    setLoading(true);
    let template;
    let body = {};
    if (["autoTestPCR", "imageRight", "rules"].includes(view)) {
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_DOCUMENT;
      body = { type_document: translateFileStatusPhase1(view) };
    } else if (view === "cohesionStayMedical") {
      template = SENDINBLUE_TEMPLATES.young.PHASE_1_FOLLOW_UP_MEDICAL_FILE;
    }

    try {
      const { ok } = await api.post(`/young/${young._id}/email/${template}`, body);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la relance du volontaire");
      toastr.success("Relance du volontaire envoyée avec succès");
      setLoading(false);
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoie de la relance :", translate(e.code));
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
        title: `Vous êtes sur le point de demander la correction du document ${translateFileStatusPhase1(name)}`,
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
    <>
      {environment !== "production" ? (
        <article className="flex items-start justify-between flex-wrap">
          <div className="flex flex-col justify-center items-center">
            <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
              <div className="flex row justify-center mx-2 mb-3">
                <select disabled={loading} className="form-control text-sm" value={statusCohesionStayMedical} name="cohesionStayMedical" onChange={(e) => needModal(e)}>
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
          <div className="flex flex-col justify-center items-center">
            <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
              <div className="flex row justify-center mx-2 mb-3">
                <select disabled={loading} className="form-control text-sm" value={statusImageRight} name="imageRight" onChange={(e) => needModal(e)}>
                  {options.map((o, i) => (
                    <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                      {translateFileStatusPhase1(o)}
                    </option>
                  ))}
                </select>
              </div>
              <FileIcon icon="image" filled={young.imageRightFilesStatus !== "TO_UPLOAD"} />
              <p className="text-base font-bold mt-2">Droit à l&apos;image</p>
              <p className="text-gray-500">Accord : {dataImageRight.imageRight ? translate(dataImageRight.imageRight) : "Non renseigné"}</p>
              <ButtonPlain onClick={() => setIsOpenImg(true)}>Gérer le document</ButtonPlain>
            </section>
            <ModalDocument
              isOpen={isOpenImg}
              onCancel={() => setIsOpenImg(false)}
              initialValues={dataImageRight}
              young={young}
              name="imageRight"
              nameFiles="imageRightFiles"
              title="Consentement de droit à l'image"
              comment={young.imageRightFilesComment}
            />
            {statusImageRight === FILE_STATUS_PHASE1.TO_UPLOAD && (
              <ButtonPlain
                tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
                disabled={loading}
                className="border rounded-lg m-2 px-4 py-2"
                onClick={() => handleEmailClick("imageRight")}>
                Relancer le volontaire
              </ButtonPlain>
            )}
          </div>
          <div className="flex flex-col justify-center items-center">
            <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
              <div className="flex row justify-center mx-2 mb-3">
                <select disabled={loading} className="form-control text-sm" value={statusAutoTestPCR} name="autoTestPCR" onChange={(e) => needModal(e)}>
                  {options.map((o) => (
                    <option key={o} value={o} label={translateFileStatusPhase1(o)}>
                      {translateFileStatusPhase1(o)}
                    </option>
                  ))}
                </select>
              </div>
              <FileIcon icon="autotest" filled={young.autoTestPCRFilesStatus !== "TO_UPLOAD"} />
              <p className="text-base font-bold mt-2">Autotest PCR</p>
              <p className="text-gray-500">Accord : {dataAutoTestPCR.autoTestPCR ? translate(dataAutoTestPCR.autoTestPCR) : "Non renseigné"}</p>
              <ButtonPlain onClick={() => setIsOpenAut(true)}>Gérer le document</ButtonPlain>
            </section>
            <ModalDocument
              isOpen={isOpenAut}
              onCancel={() => setIsOpenAut(false)}
              initialValues={dataAutoTestPCR}
              young={young}
              name="autoTestPCR"
              nameFiles="autoTestPCRFiles"
              title="Consentement à l'utilisation d'autotest COVID"
              comment={young.autoTestPCRFilesComment}
            />
            {statusAutoTestPCR === FILE_STATUS_PHASE1.TO_UPLOAD && (
              <ButtonPlain
                tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
                disabled={loading}
                className="border rounded-lg m-2 px-4 py-2"
                onClick={() => handleEmailClick("autoTestPCR")}>
                Relancer le volontaire
              </ButtonPlain>
            )}
          </div>
          <div className="flex flex-col justify-center items-center">
            <section className="bg-gray-50 rounded-lg w-[280px] h-[300px] m-2 flex flex-col items-center justify-start p-4">
              <div className="flex row justify-center mx-2 mb-3">
                <select disabled={loading} className="form-control text-sm" value={statusRules} name="rules" onChange={(e) => needModal(e)}>
                  {options.map((o, i) => (
                    <option key={i} value={o} label={translateFileStatusPhase1(o)}>
                      {translateFileStatusPhase1(o)}
                    </option>
                  ))}
                </select>
              </div>
              <FileIcon icon="reglement" filled={young.rulesFilesStatus !== "TO_UPLOAD"} />
              <p className="text-base font-bold mt-2">Règlement intérieur</p>
              <p className="text-gray-500">Accord : {dataRules.rulesParent1 ? translate(dataRules.rulesParent1) : "Non renseigné"}</p>
              <ButtonPlain onClick={() => setIsOpenReg(true)}>Gérer le document</ButtonPlain>
            </section>
            <ModalDocument
              isOpen={isOpenReg}
              onCancel={() => setIsOpenReg(false)}
              initialValues={dataRules}
              young={young}
              nameFiles="rulesFiles"
              title="Règlement intérieur"
              comment={young.rulesFilesComment}
            />
            {statusRules === FILE_STATUS_PHASE1.TO_UPLOAD && (
              <ButtonPlain
                tw="bg-white border-[1px] border-indigo-600 text-indigo-600"
                disabled={loading}
                className="border rounded-lg m-2 px-4 py-2"
                onClick={() => handleEmailClick("rules")}>
                Relancer le volontaire
              </ButtonPlain>
            )}
          </div>
          <ModalConfirmWithMessage
            isOpen={modal?.isOpen}
            title={modal?.title}
            message={modal?.message}
            placeholder="Précisez les corrections à apporter ici"
            onChange={() => {
              setModal({ isOpen: false, onConfirm: null }), setLoading(false);
            }}
            onConfirm={(message) => {
              modal?.onConfirm(message);
              setModal({ isOpen: false, onConfirm: null });
            }}
          />
        </article>
      ) : (
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
              {statusCohesionStayMedical === "TO_DOWNLOAD" && (
                <button disabled={loading} className="border rounded-lg border-8 m-2 px-4 py-2" onClick={() => handleEmailClick("cohesionStayMedical")}>
                  Relancer le volontaire
                </button>
              )}
            </div>
          </Col>
          <Col md={6} style={{ borderBottom: "2px solid #f4f5f7" }}>
            <div className="flex row justify-center mx-2 my-1">
              <h1 className="text-center pb-2">Droit a l&apos;image</h1>

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
                        <h4>Formulaire de consentement droit a l'image</h4>
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
              {statusImageRight === FILE_STATUS_PHASE1.TO_UPLOAD && (
                <button disabled={loading} className="rounded-lg border-8 m-2 px-4 py-2" onClick={() => handleEmailClick("imageRight")}>
                  Relancer le volontaire
                </button>
              )}
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
              {statusAutoTestPCR === FILE_STATUS_PHASE1.TO_UPLOAD && (
                <button disabled={loading} className="border rounded-lg border-8 m-2 px-4 py-2" onClick={() => handleEmailClick("autoTestPCR")}>
                  Relancer le volontaire
                </button>
              )}
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
              {statusRules === FILE_STATUS_PHASE1.TO_UPLOAD && (
                <button disabled={loading} className="border rounded-lg border-8 m-2 px-4 py-2" onClick={() => handleEmailClick("rules")}>
                  Relancer le volontaire
                </button>
              )}
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
      )}
    </>
  );
}
