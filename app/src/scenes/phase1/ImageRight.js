import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Field } from "formik";
import DndFileInput from "../../components/dndFileInput";
import { HeroContainer, Hero } from "../../components/Content";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate } from "../../utils";
import { SuccessMessage, RadioLabel, Footer, FormGroup, FormRow, Title, Logo, DownloadText, BackButton, Content, SignBox, ContinueButton } from "./components/printable";
import DownloadFormButton from "../../components/buttons/DownloadFormButton";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const isPlural = young?.parent1Status && young?.parent2Status;

  const dispatch = useDispatch();

  return (
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
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                ></path>
              </svg>
            </div>
            <div>
              <h2>Consentement de droit à l'image</h2>
              <p style={{ color: "#9C9C9C" }}>
                {isPlural ? "Vos représentants légaux doivent" : "Votre représentant légal doit"} renseigner le formulaire relatif au droit à l'image avant votre départ en séjour
                de cohésion. Cette étape est un pré-requis au séjour de cohésion.
              </p>
            </div>
          </div>
          {young.imageRightFiles && young.imageRightFiles.length ? (
            <SuccessMessage>
              <Logo>
                <svg height={64} width={64} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </Logo>
              Vous avez bien renseigné le document
            </SuccessMessage>
          ) : (
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
                    const { ok, code, data: young } = await api.put("/young", values);
                    if (!ok) return toastr.error("Une erreur s'est produite", translate(code));
                    dispatch(setYoung(young));
                    toastr.success("Mis à jour !");
                  } catch (e) {
                    console.log(e);
                    toastr.error("Erreur !");
                  }
                }}
              >
                {({ values, handleChange, handleSubmit, errors, touched, isSubmitting, submitForm }) => (
                  <>
                    <Title>
                      <span>
                        {isPlural ? "Seuls les représentants légaux sont habilités à valider ce consentement" : "Seul le représentant légal est habilité à valider ce consentement"}
                      </span>
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
                    <Title>
                      <span>Autorisez ou non le droit à l'image</span>
                    </Title>
                    <FormRow>
                      <Col>
                        <RadioLabel>
                          <Field
                            id="imageRight_true"
                            validate={(v) => !v && requiredMessage}
                            type="radio"
                            name="imageRight"
                            value="true"
                            checked={values.imageRight === "true"}
                            onChange={handleChange}
                          />
                          <label htmlFor="imageRight_true">
                            {isPlural ? "Nous autorisons" : "J'autorise"} le Ministère de l’Education Nationale, de la Jeunesse et des Sports (MENJS), ses partenaires et les
                            journalistes dûment accrédités par les services communication du ministère et/ou des préfecture à enregistrer, reproduire et représenter l’image et/ou
                            la voix du volontaire représenté en partie ou en intégralité, ensemble ou séparément, sur leurs publications respectives.
                          </label>
                        </RadioLabel>
                        <RadioLabel>
                          <Field
                            id="imageRight_false"
                            validate={(v) => !v && requiredMessage}
                            type="radio"
                            name="imageRight"
                            value="false"
                            checked={values.imageRight === "false"}
                            onChange={handleChange}
                          />
                          <label htmlFor="imageRight_false">
                            {isPlural ? "Nous n'autorisons" : "Je n'autorise"} pas le Ministère de l’Education Nationale, de la Jeunesse et des Sports, ses partenaires et les
                            journalistes à enregistrer, reproduire et représenter l’image et/ou la voix du volontaire représenté en partie ou en intégralité, ensemble ou
                            séparément, sur leurs publications respectives.
                          </label>
                        </RadioLabel>
                        <ErrorMessage errors={errors} touched={touched} name="imageRight" />
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
                            <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/droit_a_l_image_2022.pdf" target="_blank">
                              télécharger le modèle à remplir
                            </a>
                          </BackButton>
                          <DndFileInput
                            placeholder="le formulaire"
                            errorMessage="Vous devez téléverser le formulaire"
                            value={values.imageRightFiles}
                            name="imageRightFiles"
                            onChange={async (e) => {
                              const res = await api.uploadFile("/young/file/imageRightFiles", e.target.files);
                              if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                              // We update it instant ( because the bucket is updated instant )
                              toastr.success("Fichier téléversé");
                              handleChange({ target: { value: res.data, name: "imageRightFiles" } });
                            }}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="imageRightFiles" />
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
                        <ContinueButton onClick={handleSubmit}>Valider le consentement</ContinueButton>
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
};
