import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Field } from "formik";
import DndFileInput from "../../components/dndFileInput";
import { HeroContainer, Hero } from "../../components/Content";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate, colors } from "../../utils";
import { SuccessMessage, RadioLabel, Footer, FormGroup, FormRow, Title, Logo, BackButton, Content } from "./components/printable";
import LoadingButton from "../../components/buttons/LoadingButton";
import styled from "styled-components";

export default function AutoTest() {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const isPlural = young?.parent1Status && young?.parent2Status;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFields, setShowFields] = useState(!young.autoTestPCRFiles?.length);

  return (
    <HeroContainer>
      <Hero>
        <Content style={{ width: "100%" }} id="autoTest">
          <div style={{ display: "flex" }}>
            <div className="icon">
              <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
            </div>
            <div>
              <h2>Consentement à l’utilisation d’autotest COVID</h2>
              <p style={{ color: "#9C9C9C" }}>
                {isPlural ? "Vos représentants légaux doivent" : "Votre représentant légal doit"} renseigner le formulaire relatif à l’utilisation d’autotest COVID pendant le
                séjour de cohésion avant votre départ en séjour. Cette étape est un pré-requis au séjour de cohésion.
                <br />
                <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Note_relative_a_l_utilisation_d_autotest_COVID.pdf" target="blank" className="link">
                  Note relative à l’utilisation d’autotest antigénique COVID ›
                </a>
              </p>
            </div>
          </div>
          {young.autoTestPCRFiles && young.autoTestPCRFiles.length ? (
            <>
              <SuccessMessage>
                <Logo>
                  <svg height={64} width={64} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </Logo>
                Vous avez bien renseigné le document
              </SuccessMessage>
              {!showFields && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <VioletButton onClick={() => setShowFields(true)}>Modifier</VioletButton>
                </div>
              )}
            </>
          ) : null}
          {showFields && (
            <>
              <Formik
                initialValues={{
                  ...young,
                  firstName1: young.parent1FirstName,
                  lastName1: young.parent1LastName,
                  firstName2: young.parent2FirstName,
                  lastName2: young.parent2LastName,
                  parentPhone: young.parent1Phone,
                }}
                validateOnChange={false}
                validateOnBlur={false}
                onSubmit={async (values) => {
                  try {
                    setLoading(true);
                    const { autoTestPCR, autoTestPCRFiles } = values;
                    const { ok, code, data: young } = await api.put("/young", { autoTestPCR, autoTestPCRFiles });
                    setLoading(false);
                    if (!ok) return toastr.error("Une erreur s'est produite", translate(code));
                    dispatch(setYoung(young));
                    toastr.success("Mis à jour !");
                    setShowFields(false);
                  } catch (e) {
                    setLoading(false);
                    console.log(e);
                    toastr.error("Erreur !");
                  }
                }}>
                {({ values, handleChange, handleSubmit, errors, touched }) => (
                  <>
                    <Title>
                      <span>Seuls les représentants légaux sont habilités à valider ce consentement</span>
                    </Title>
                    <FormGroup>
                      <label>REPRÉSENTANT LÉGAL N°1</label>
                      <Row>
                        <Col md={6}>
                          <Field
                            validate={(v) => !v && requiredMessage}
                            placeholder="Prénom du représentants légal n°1"
                            name="firstName1"
                            value={values.firstName1}
                            onChange={handleChange}
                            className="form-control"
                          />
                          <ErrorMessage errors={errors} touched={touched} name="firstName1" />
                        </Col>
                        <Col md={6}>
                          <Field
                            validate={(v) => !v && requiredMessage}
                            placeholder="Nom du représentants légal n°1"
                            name="lastName1"
                            value={values.lastName1}
                            onChange={handleChange}
                            className="form-control"
                          />
                          <ErrorMessage errors={errors} touched={touched} name="lastName1" />
                        </Col>
                      </Row>
                    </FormGroup>
                    {values.firstName2 ? (
                      <FormGroup>
                        <label>REPRÉSENTANT LÉGAL N°2</label>
                        <Row>
                          <Col md={6}>
                            <Field
                              validate={(v) => !v && requiredMessage}
                              placeholder="Prénom du représentants légal n°2"
                              name="firstName2"
                              value={values.firstName2}
                              onChange={handleChange}
                              className="form-control"
                            />
                            <ErrorMessage errors={errors} touched={touched} name="firstName2" />
                          </Col>
                          <Col md={6}>
                            <Field
                              validate={(v) => !v && requiredMessage}
                              placeholder="Nom du représentants légal n°2"
                              name="lastName2"
                              value={values.lastName2}
                              onChange={handleChange}
                              className="form-control"
                            />
                            <ErrorMessage errors={errors} touched={touched} name="lastName2" />
                          </Col>
                        </Row>
                      </FormGroup>
                    ) : null}
                    <FormRow>
                      <Col>
                        <RadioLabel>
                          <Field
                            id="autoTestPCR_true"
                            validate={(v) => !v && requiredMessage}
                            type="radio"
                            name="autoTestPCR"
                            value="true"
                            checked={values.autoTestPCR === "true"}
                            onChange={handleChange}
                          />
                          <label htmlFor="autoTestPCR_true">
                            {isPlural ? "Nous autorisons" : "J’autorise"} la <b>réalisation d’autotests antigéniques</b> sur prélèvement nasal par l’enfant dont{" "}
                            {isPlural ? "nous sommes titulaires" : "je suis titulaire"} de l’autorité parentale, et, en cas de résultat positif, la communication de celui-ci au
                            directeur académiques des services académiques, à l’ARS, au chef de centre et aux personnes habilitées par ce dernier.
                          </label>
                        </RadioLabel>
                      </Col>
                    </FormRow>
                    <FormRow>
                      <Col>
                        <RadioLabel>
                          <Field
                            id="autoTestPCR_false"
                            validate={(v) => !v && requiredMessage}
                            type="radio"
                            name="autoTestPCR"
                            value="false"
                            checked={values.autoTestPCR === "false"}
                            onChange={handleChange}
                          />
                          <label htmlFor="autoTestPCR_false">
                            {isPlural ? "Nous n'autorisons" : "Je n’autorise"} pas la <b>réalisation d&apos;autotests antigéniques</b>
                          </label>
                        </RadioLabel>
                        <ErrorMessage errors={errors} touched={touched} name="autoTestPCR" />
                      </Col>
                    </FormRow>
                    <div className="noPrint">
                      {/* @todo add with france connect */}
                      {/* <Title>
                    <span>Vous pouvez signer le formulaire de deux façons</span>
                  </Title> */}
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <div>
                          {/* <BackButton>
                            <DownloadFormButton young={values} uri="autotestPCR">
                              Télécharger le formulaire pré-rempli
                            </DownloadFormButton>
                          </BackButton> */}
                          <BackButton>
                            <a
                              href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Consentement_a_l_utilisation_d_autotest_COVID.pdf"
                              target="_blank"
                              rel="noreferrer">
                              télécharger le modèle à remplir
                            </a>
                          </BackButton>
                          <DndFileInput
                            placeholder="le formulaire"
                            errorMessage="Vous devez téléverser le formulaire"
                            value={values.autoTestPCRFiles}
                            name="autoTestPCRFiles"
                            onChange={async (e) => {
                              setUploading(true);
                              const res = await api.uploadFile("/young/file/autoTestPCRFiles", e.target.files);
                              if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                              // We update it instant ( because the bucket is updated instant )
                              toastr.success("Fichier téléversé");
                              handleChange({ target: { value: res.data, name: "autoTestPCRFiles" } });
                              setUploading(false);
                            }}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="autoTestPCRFiles" />
                        </div>
                        {/* <div>OU</div>
                    <div>FRANCE CONNECT</div> */}
                      </div>
                    </div>
                    {/* <SignBox className="onlyPrint">
                      <Row>
                        <Col md={6}>
                          <div>Sous réserve du respect de l’ensemble de ces conditions, le consentement délivré est libre et éclairé.</div>
                          <div>Fait à :</div>
                          <div>Le :</div>
                          <div>
                            Signature du représentant légal n°1
                            <br />
                            Précédée(s) de la mention « lu et approuvé – bon pour accord »
                          </div>
                        </Col>
                        <Col md={6}>
                          <div>Sous réserve du respect de l’ensemble de ces conditions, le consentement délivré est libre et éclairé.</div>
                          <div>Fait à :</div>
                          <div>Le :</div>
                          <div>
                            Signature du représentant légal n°2
                            <br />
                            Précédée(s) de la mention « lu et approuvé – bon pour accord »
                          </div>
                        </Col>
                      </Row>
                    </SignBox> */}
                    <Footer className="noPrint">
                      <Title />
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <LoadingButton loading={loading} disabled={uploading} onClick={handleSubmit}>
                          Valider le consentement
                        </LoadingButton>
                      </div>
                      {Object.keys(errors).length ? <h3>Vous ne pouvez pas valider le formulaire car tous les champs ne sont pas correctement renseignés.</h3> : null}
                    </Footer>
                  </>
                )}
              </Formik>
            </>
          )}
        </Content>
      </Hero>
    </HeroContainer>
  );
}

const VioletButton = styled(Button)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  margin: 0;
  margin-top: 1rem;
  font-size: 14px;
  font-weight: 700;
  color: #fff !important;
  cursor: pointer;
  background-color: ${colors.purple} !important;
  &:hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.5);
  }
`;
