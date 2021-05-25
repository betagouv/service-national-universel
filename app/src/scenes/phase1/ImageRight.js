import React, { useState } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Field } from "formik";
import DndFileInput from "../../components/dndFileInput";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate } from "../../utils";
import {
  SuccessMessage,
  RadioLabel,
  Footer,
  FormGroup,
  FormRow,
  ConsentementBox,
  Title,
  Logo,
  DownloadText,
  BackButton,
  Content,
  SignBox,
  Info,
  ContinueButton,
} from "./components/printable";

const AuthorizationIntro = () => (
  <div>
    Cette autorisation emporte la possibilité pour l’Administration ainsi que ses ayants droit éventuels ou toute personne accréditée ou autorisée par elle à enregistrer, à
    reproduire et à représenter l’image et la voix du volontaire représenté légalement, en partie ou en intégralité, ensemble ou séparément, sur les médias / supports détaillés
    ci-dessous.
  </div>
);

const AuthorizationDetails = () => (
  <div>
    <b>Cette autorisation est valable pour une utilisation :</b>
    <ul>
      <li>
        <b>• Pour une durée de :</b> 5 ans à compter de la signature de la présente
      </li>
      <li>
        <b>• Sur tous les territoires :</b> monde, tous pays
      </li>
      <li>
        • Sur tous les supports matériels et immatériels, en tous formats connus ou inconnus à ce jour, et notamment, sans que cette liste ne soit exhaustive : support papier
        (tirages des photographies), catalogues et éditions diverses, CDROM / DVDROM et autres supports numériques connus et inconnus à ce jour, tout support audiovisuel, notamment
        cinéma, TV et par tous moyens inhérents à ce mode de communication, internet (incluant Intranet, Extranet, Blogs, réseaux sociaux), tous vecteurs de réception confondus
        (smartphones, tablettes, etc.), médias presse (spots publicitaires télévisuels, spots publicitaires cinématographiques), supports de communication interne, supports
        promotionnels (PLV, ILV, campagnes d’affichage en tous lieux, toutes dimensions et sur tous supports (urbain, aéroports, gares, transports en commun, etc.), supports
        destinés à la vente (produits de merchandising : cartes postales, posters, tee-shirt, produits dérivés, etc.) • De l’image du volontaire représenté légalement en tant que
        telle, modifiée ou non, et/ou intégrée dans une œuvre papier, numérique ou audiovisuelle, telle qu’une émission, un reportage, un documentaire, une bande annonce
        promotionnelle, etc.
      </li>
    </ul>
    <b>La présente autorisation est consentie à titre gratuit.</b>
  </div>
);

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [expandInfo, setExpandInfo] = useState(false);
  const dispatch = useDispatch();

  const toggleInfo = () => setExpandInfo(!expandInfo);

  return (
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
          <p>
            Votre représentant légal peut dès à présent renseigner le formulaire relatif au droit à l'image <b>avant le 4 juin 2021</b>.
            <br />
            <i>Cette étape est un pré-requis au séjour de cohésion.</i>
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
        <ConsentementBox id="printArea">
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
                        Nous autorisons l'Administration à reproduire et exploiter l'image et la voix de{" "}
                        <b>
                          {young.firstName} {young.lastName}
                        </b>{" "}
                        que nous représentons légalement, sur les supports visés ci-après à des fins de promotion du Service Nationnel Universel
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
                        Nous n'autorisons pas l'Administration à reproduire et exploiter l'image et la voix de{" "}
                        <b>
                          {young.firstName} {young.lastName}
                        </b>{" "}
                        que nous représentons légalement, sur les supports visés ci-après à des fins de promotion du Service Nationnel Universel
                      </label>
                    </RadioLabel>
                    <ErrorMessage errors={errors} touched={touched} name="imageRight" />
                  </Col>
                </FormRow>
                <Info className="noPrint">
                  <AuthorizationIntro />
                  {expandInfo ? <AuthorizationDetails /> : "..."}
                  <span onClick={toggleInfo}>{expandInfo ? "  VOIR MOINS" : "  VOIR PLUS"}</span>
                </Info>
                <Info className="onlyPrint">
                  <AuthorizationIntro />
                  <AuthorizationDetails />
                </Info>
                <div className="noPrint">
                  {/* @todo add with france connect */}
                  {/* <Title>
                    <span>Vous pouvez signer le formulaire de deux façons</span>
                  </Title> */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div>
                      {/* <BackButton onClick={() => print()}>Imprimer le formulaire pré-rempli</BackButton> */}
                      <DownloadText>
                        {/* Ou{" "} */}
                        <a style={{ fontSize: "1rem" }} href="https://apicivique.s3.eu-west-3.amazonaws.com/consentement_droit_image.pdf" target="_blank">
                          télécharger le modèle à remplir
                        </a>
                      </DownloadText>
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
                <SignBox className="onlyPrint">
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
                </SignBox>
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
        </ConsentementBox>
      )}
    </Content>
  );
};
