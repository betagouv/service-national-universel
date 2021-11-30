import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { Formik } from "formik";
import { Col } from "reactstrap";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import DndFileInput from "../../../components/dndFileInput";
import ErrorMessage from "../components/errorMessage";
import FormRow from "../../../components/form/FormRow";
import InfoIcon from "../../../components/InfoIcon";
import api from "../../../services/api";
import FormFooter from "../../../components/form/FormFooter";
import { STEPS } from "../utils";
import { setYoung } from "../../../redux/auth/actions";
import { getAge, translate } from "../../../utils";

export default function StepDocuments() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const isParentFromFranceConnect = () => {
    if (young.parent1Status && young.parent2Status) {
      return young.parent1FromFranceConnect === "true" && young.parent2FromFranceConnect === "true";
    } else {
      return young.parent1FromFranceConnect === "true";
    }
  };

  return (
    <Wrapper>
      <Heading>
        <h2>Pièces justificatives</h2>
        <p>Téléversez ci-dessous les justificatifs requis pour votre inscription</p>
      </Heading>

      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            values.inscriptionStep = STEPS.AVAILABILITY;
            const { ok, code, data } = await api.put("/young", { ...values, inscriptionStep: STEPS.DONE });
            if (!ok || !data?._id) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(data));
            history.push("/inscription/done");
          } catch (e) {
            console.log(e);
            toastr.error("Erreur !");
          } finally {
            setLoading(false);
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <FormRow>
              <Col md={4}>
                <Label>Pièce d&apos;identité du volontaire</Label>
                <AlerteInfo>Carte nationale d&apos;identité RECTO-VERSO ou passeport dans un format lisible</AlerteInfo>
              </Col>
              <Col>
                <DndFileInput
                  placeholder="votre pièce d'identité* (recto-verso)"
                  errorMessage="Vous devez téléverser votre pièce d'identité"
                  value={values.cniFiles}
                  name="cniFiles"
                  onChange={async (e) => {
                    const res = await api.uploadFile("/young/file/cniFiles", e.target.files);

                    if (res.code === "FILE_CORRUPTED") {
                      return toastr.error(
                        "Le fichier semble corrompu",
                        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                        { timeOut: 0 },
                      );
                    }
                    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                    // We update it instant ( because the bucket is updated instant )
                    toastr.success("Fichier téléversé");
                    handleChange({ target: { value: res.data, name: "cniFiles" } });
                  }}
                />
                <ErrorMessage errors={errors} touched={touched} name="cniFiles" />
              </Col>
            </FormRow>
            {!isParentFromFranceConnect() && (
              <>
                <FormRow>
                  <Col md={4}>
                    <Label>Consentement du ou des représentant légaux</Label>
                    <AlerteInfo>
                      Merci de télécharger le consentement du ou des representants légaux, le compléter, le dater, le signer, le photographier ou le scanner et le déposer ici.
                    </AlerteInfo>
                  </Col>
                  <Col>
                    <>
                      <DownloadFormButton url="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Consentement_du_representant_legal_2022.pdf" />
                      <DndFileInput
                        placeholder="le formulaire complété"
                        errorMessage="Vous devez téléverser le formulaire complété."
                        name="parentConsentmentFiles"
                        value={values.parentConsentmentFiles}
                        onChange={async (e) => {
                          let { data: files, ok, code } = await api.uploadFile("/young/file/parentConsentmentFiles", e.target.files);

                          if (code === "FILE_CORRUPTED") {
                            return toastr.error(
                              "Le fichier semble corrompu",
                              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                              { timeOut: 0 },
                            );
                          }

                          if (!ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                          handleChange({ target: { value: files, name: "parentConsentmentFiles" } });
                          toastr.success("Fichier téléversé");
                        }}
                      />
                      <ErrorMessage errors={errors} touched={touched} name="parentConsentmentFiles" />
                    </>
                  </Col>
                </FormRow>
                {getAge(young.birthdateAt) < 15 && (
                  <FormRow>
                    <Col md={4}>
                      <Label>Accord à la collecte et au traitement des données personnelles des moins de 15 ans</Label>
                      <AlerteInfo>Merci de télécharger l&apos;accord, le compléter, le dater, le signer, le photographier ou le scanner et le déposer ici.</AlerteInfo>
                    </Col>
                    <Col>
                      <>
                        <DownloadFormButton url="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Accord_collecte_et_traitement_des_donnees_des_moins_de_15_ans_v2.pdf" />
                        <DndFileInput
                          placeholder="le formulaire complété"
                          errorMessage="Vous devez téléverser le formulaire complété."
                          name="dataProcessingConsentmentFiles"
                          value={values.dataProcessingConsentmentFiles}
                          onChange={async (e) => {
                            let { data: files, ok, code } = await api.uploadFile("/young/file/dataProcessingConsentmentFiles", e.target.files);

                            if (code === "FILE_CORRUPTED") {
                              return toastr.error(
                                "Le fichier semble corrompu",
                                "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                                { timeOut: 0 },
                              );
                            }

                            if (!ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                            handleChange({ target: { value: files, name: "dataProcessingConsentmentFiles" } });
                            toastr.success("Fichier téléversé");
                          }}
                        />
                        <ErrorMessage errors={errors} touched={touched} name="dataProcessingConsentmentFiles" />
                      </>
                    </Col>
                  </FormRow>
                )}
              </>
            )}
            <FormFooter loading={loading} values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
}

const AlerteInfo = ({ children }) => (
  <div style={{ display: "flex", color: "#32257f", backgroundColor: "#edecfc", padding: "1rem", borderRadius: "6px" }}>
    <InfoIcon color="#32257F" style={{ flex: "none" }} />
    <div style={{ fontSize: ".9rem", marginLeft: "5px" }}>{children}</div>
  </div>
);

const DownloadFormButton = ({ url }) => (
  <div
    style={{
      cursor: "pointer",
      padding: "9px 17px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      width: "fit-content",
      boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
      margin: "20px 0",
    }}>
    <a href={url} target="_blank" style={{ decoration: "none", color: "#22252A" }} rel="noreferrer">
      Télécharger le modèle obligatoire
    </a>
  </div>
);

const Wrapper = styled.div`
  padding: 40px;
  @media (max-width: 768px) {
    padding: 22px;
  }
`;

const Heading = styled.div`
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 1.8rem;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 1rem;
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
  p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
`;
