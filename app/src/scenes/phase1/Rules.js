import React, { useState } from "react";
import { Col, Button, Modal } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Field } from "formik";
import DndFileInput from "../../components/dndFileInput";
import { HeroContainer, Hero } from "../../components/Content";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import { ModalContainer } from "../../components/modals/Modal";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate, colors } from "../../utils";
import { SuccessMessage, RadioLabel, Footer, FormRow, Title, Logo, BackButton, Content } from "./components/printable";
import LoadingButton from "../../components/buttons/LoadingButton";
import styled from "styled-components";
import CloseSvg from "../../assets/Close";
import DownloadButton from "./components/DownloadButton";
import { environment } from "../../config";

export default function Rules({ isOpen, onCancel }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const isPlural = young?.parent1Status && young?.parent2Status;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFields, setShowFields] = useState(!young.rulesFiles?.length);

  return (
    <>
      {environment !== "production" ? (
        <Modal centered isOpen={isOpen} toggle={onCancel} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
            <div className="w-full py-8 px-8 lg:px-20" id="imageRight">
              <section className="flex text-center">
                <div>
                  <h2 className="mt-0">Téléversez votre règlement intérieur</h2>
                  <p className="text-[#9C9C9C] my-3">
                    Vous et {isPlural ? "vos représentants légaux" : "votre représentant légal"} devez lire et acceptez les règles de fonctionnement propres aux centres du Service
                    National Universel exposées dans le règlement intérieur ci-joint avant votre départ en séjour. Cette étape est un pré-requis au séjour de cohésion.
                  </p>
                </div>
              </section>
              {young.rulesFiles && young.rulesFiles.length ? (
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
                    }}
                    validateOnChange={false}
                    validateOnBlur={false}
                    onSubmit={async (values) => {
                      try {
                        setLoading(true);
                        const { rulesYoung, rulesParent1, rulesParent2, rulesFiles } = values;
                        const { ok, code, data: young } = await api.put("/young", { rulesYoung, rulesParent1, rulesParent2, rulesFiles });
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
                        <section className="bg-gray-50 rounded-lg px-3 py-4 mt-2 text-center">
                          <FormRow>
                            <Col>
                              <RadioLabel>
                                <Field
                                  id="rulesYoung"
                                  validate={(v) => !v && requiredMessage}
                                  type="radio"
                                  name="rulesYoung"
                                  value="true"
                                  checked={values.rulesYoung === "true"}
                                  onChange={handleChange}
                                  className="accent-indigo-700 checked:bg-indigo-700"
                                />
                                <label htmlFor="rulesYoung">
                                  Je,{" "}
                                  <b>
                                    {young.firstName} {young.lastName}
                                  </b>{" "}
                                  certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur
                                  ci-joint.
                                </label>
                              </RadioLabel>
                              <ErrorMessage errors={errors} touched={touched} name="rulesYoung" />
                              <RadioLabel>
                                <Field
                                  id="rulesParent1"
                                  validate={(v) => !v && requiredMessage}
                                  type="radio"
                                  name="rulesParent1"
                                  value="true"
                                  checked={values.rulesParent1 === "true"}
                                  onChange={handleChange}
                                  className="accent-indigo-700 checked:bg-indigo-700"
                                />
                                <label htmlFor="rulesParent1">
                                  Je,{" "}
                                  <b>
                                    {young.parent1FirstName} {young.parent1LastName}
                                  </b>{" "}
                                  certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur
                                  ci-joint.
                                </label>
                              </RadioLabel>
                              <ErrorMessage errors={errors} touched={touched} name="rulesParent1" />
                              {young.parent2FirstName && (
                                <>
                                  <RadioLabel>
                                    <Field
                                      id="rulesParent2"
                                      validate={(v) => !v && requiredMessage}
                                      type="radio"
                                      name="rulesParent2"
                                      value="true"
                                      checked={values.rulesParent2 === "true"}
                                      onChange={handleChange}
                                    />
                                    <label htmlFor="rulesParent2">
                                      Je,{" "}
                                      <b>
                                        {young.parent2FirstName} {young.parent2LastName}
                                      </b>{" "}
                                      certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement
                                      intérieur ci-joint.
                                    </label>
                                  </RadioLabel>
                                  <ErrorMessage errors={errors} touched={touched} name="rulesParent2" />
                                </>
                              )}
                            </Col>
                          </FormRow>
                        </section>
                        <div className="noPrint">
                          {/* @todo add with france connect */}
                          {/* <Title>
                    <span>Vous pouvez signer le formulaire de deux façons</span>
                  </Title> */}
                          <section className="flex flex-col items-center lg:flex-row lg:justify-center mt-2">
                            {/* <BackButton>
                            <DownloadFormButton young={values} uri="imageRight">
                              Télécharger le formulaire pré-rempli
                            </DownloadFormButton>
                          </BackButton> */}
                            <div className="bg-gray-50 rounded-lg px-2.5 py-4 sm:my-2 text-center w-full lg:w-[50%] lg:mt-0">
                              <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/droit_a_l_image_2022.pdf" target="_blank" rel="noreferrer">
                                <DownloadButton text="Télécharger le modèle à remplir" tw="mx-auto mb-2" />
                              </a>
                              <p className="text-sm text-gray-600 mb-3">Puis téléversez le formulaire rempli</p>
                            </div>
                            <DndFileInput
                              placeholder="le formulaire"
                              errorMessage="Vous devez téléverser le formulaire"
                              value={values.rulesFiles}
                              name="rulesFiles"
                              className="lg:w-[50%] flex flex-col justify-center items-center lg:mt-0"
                              onChange={async (e) => {
                                setUploading(true);
                                const res = await api.uploadFile("/young/file/rulesFiles", e.target.files);
                                if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                                // We update it instant ( because the bucket is updated instant )
                                toastr.success("Fichier téléversé");
                                handleChange({ target: { value: res.data, name: "rulesFiles" } });
                                setUploading(false);
                              }}
                            />
                            <ErrorMessage errors={errors} touched={touched} name="rulesFiles" />
                            {/* <div>OU</div>
                    <div>FRANCE CONNECT</div> */}
                          </section>
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
            </div>
          </ModalContainer>
        </Modal>
      ) : (
        <HeroContainer>
          <Hero>
            <Content style={{ width: "100%" }} id="imageRight">
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
                  <h2>Règlement intérieur</h2>
                  <p style={{ color: "#9C9C9C" }}>
                    Vous et {isPlural ? "vos représentants légaux" : "votre représentant légal"} devez lire et acceptez les règles de fonctionnement propres aux centres du Service
                    National Universel exposées dans le règlement intérieur ci-joint avant votre départ en séjour. Cette étape est un pré-requis au séjour de cohésion.
                  </p>
                </div>
              </div>
              {young.rulesFiles && young.rulesFiles.length ? (
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
                    }}
                    validateOnChange={false}
                    validateOnBlur={false}
                    onSubmit={async (values) => {
                      try {
                        setLoading(true);
                        const { rulesYoung, rulesParent1, rulesParent2, rulesFiles } = values;
                        const { ok, code, data: young } = await api.put("/young", { rulesYoung, rulesParent1, rulesParent2, rulesFiles });
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
                        <FormRow>
                          <Col>
                            <RadioLabel>
                              <Field
                                id="rulesYoung"
                                validate={(v) => !v && requiredMessage}
                                type="radio"
                                name="rulesYoung"
                                value="true"
                                checked={values.rulesYoung === "true"}
                                onChange={handleChange}
                              />
                              <label htmlFor="rulesYoung">
                                Je,{" "}
                                <b>
                                  {young.firstName} {young.lastName}
                                </b>{" "}
                                certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur
                                ci-joint.
                              </label>
                            </RadioLabel>
                            <ErrorMessage errors={errors} touched={touched} name="rulesYoung" />
                            <RadioLabel>
                              <Field
                                id="rulesParent1"
                                validate={(v) => !v && requiredMessage}
                                type="radio"
                                name="rulesParent1"
                                value="true"
                                checked={values.rulesParent1 === "true"}
                                onChange={handleChange}
                              />
                              <label htmlFor="rulesParent1">
                                Je,{" "}
                                <b>
                                  {young.parent1FirstName} {young.parent1LastName}
                                </b>{" "}
                                certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur
                                ci-joint.
                              </label>
                            </RadioLabel>
                            <ErrorMessage errors={errors} touched={touched} name="rulesParent1" />
                            {young.parent2FirstName && (
                              <>
                                <RadioLabel>
                                  <Field
                                    id="rulesParent2"
                                    validate={(v) => !v && requiredMessage}
                                    type="radio"
                                    name="rulesParent2"
                                    value="true"
                                    checked={values.rulesParent2 === "true"}
                                    onChange={handleChange}
                                  />
                                  <label htmlFor="rulesParent2">
                                    Je,{" "}
                                    <b>
                                      {young.parent2FirstName} {young.parent2LastName}
                                    </b>{" "}
                                    certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur
                                    ci-joint.
                                  </label>
                                </RadioLabel>
                                <ErrorMessage errors={errors} touched={touched} name="rulesParent2" />
                              </>
                            )}
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
                            <DownloadFormButton young={values} uri="imageRight">
                              Télécharger le formulaire pré-rempli
                            </DownloadFormButton>
                          </BackButton> */}
                              <BackButton>
                                <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/reglement_interieur_Fevrier_2022.pdf" target="_blank" rel="noreferrer">
                                  télécharger le modèle à remplir
                                </a>
                              </BackButton>
                              <DndFileInput
                                placeholder="le formulaire"
                                errorMessage="Vous devez téléverser le formulaire"
                                value={values.rulesFiles}
                                name="rulesFiles"
                                onChange={async (e) => {
                                  setUploading(true);
                                  const res = await api.uploadFile("/young/file/rulesFiles", e.target.files);
                                  if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                                  // We update it instant ( because the bucket is updated instant )
                                  toastr.success("Fichier téléversé");
                                  handleChange({ target: { value: res.data, name: "rulesFiles" } });
                                  setUploading(false);
                                }}
                              />
                              <ErrorMessage errors={errors} touched={touched} name="rulesFiles" />
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
                          <div className="text-xs italic"> Vous pouvez téléverser uniquement la dernière page signée du règlement intérieur </div>
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
      )}
    </>
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
