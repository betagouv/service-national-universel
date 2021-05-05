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
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib/constants";

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
    <Hero style={{ flexDirection: "column" }}>
      <Content style={{ width: "100%" }}>
        <h1>Prochaine étape</h1>
        {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION ? (
          <>
            <p>
              Vous êtes actuellement <Tag>en&nbsp;attente&nbsp;d'affectation à un centre de cohésion.</Tag>
            </p>
            <p>Vous serez informé(e) par e-mail du lieu et des modalités de votre séjour fin mai.</p>
          </>
        ) : null}
      </Content>
      <ContentHorizontal style={{ width: "100%" }} id="sanitaire">
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            ></path>
          </svg>
        </div>
        <div>
          <h2>Transmission de la fiche sanitaire</h2>
          <p>Téléchargez la fiche sanitaire.</p>
          <p>
            Vous devez renvoyer votre fiche sanitaire complétée et signée par voie postale sous pli confidentiel au plus tard le 4 juin 2021. L'adresse de destination vous sera
            communiqué sur cette page, une fois votre lieu d'affectation connue.
          </p>
          <a href="https://apicivique.s3.eu-west-3.amazonaws.com/Note_relative_aux_informations_d_ordre_sanitaire.pdf" target="blank" className="link">
            Note relative aux informations d'ordre sanitaire{" >"}
          </a>
        </div>
        <div style={{ minWidth: "30%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "1.5rem" }}>
          <a target="blank" href="https://apicivique.s3.eu-west-3.amazonaws.com/Fiche_sanitaire.pdf">
            <ContinueButton>Télécharger la fiche sanitaire</ContinueButton>
          </a>
        </div>
      </ContentHorizontal>
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
              Votre représentant légal peut dès-à-présent renseigner le formulaire relatif au droit à l'image <b>avant le 4 juin 2021</b>. Cette étape est un pré-requis au séjour
              de cohésion.
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
                          id="true"
                          validate={(v) => !v && requiredMessage}
                          type="radio"
                          name="imageRight"
                          value="true"
                          checked={values.imageRight === "true"}
                          onChange={handleChange}
                        />
                        <label htmlFor="true">
                          Nous autorisons l'Administration à reproduire et exploiter l'image et la voix de{" "}
                          <b>
                            {young.firstName} {young.lastName}
                          </b>{" "}
                          que nous représentons légalement, sur les supports visés ci-après à des fins de promotion du Service Nationnel Universel
                        </label>
                      </RadioLabel>
                      <RadioLabel>
                        <Field
                          id="false"
                          validate={(v) => !v && requiredMessage}
                          type="radio"
                          name="imageRight"
                          value="false"
                          checked={values.imageRight === "false"}
                          onChange={handleChange}
                        />
                        <label htmlFor="false">
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
                        <BackButton onClick={() => print()}>Imprimer le formulaire pré-rempli</BackButton>
                        <DownloadText>
                          Ou{" "}
                          <a href="https://apicivique.s3.eu-west-3.amazonaws.com/consentement_droit_image.pdf" target="_blank">
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
    </Hero>
  );
};

const Logo = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: #def7ec;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  img {
    color: #057a55;
  }
`;
const SuccessMessage = styled.div`
  padding: 0.5rem;
  margin: 0 auto;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #046c4e;
  font-size: 0.8rem;
  width: fit-content;
`;

const DownloadText = styled.div`
  font-size: 0.8rem;
  color: #555;
  width: 100%;
  text-align: center;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
  a {
    color: #5850ec;
  }
`;

const Tag = styled.span`
  color: #42389d;
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  background-color: #e5edff;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const Hero = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  max-width: 80rem;
  margin: 1rem auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    padding: 60px 30px 60px 50px;
    @media (max-width: 768px) {
      width: 100%;
      padding: 30px 10px 30px 20px;
    }
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h2 {
    font-size: 1.5rem;
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;

const BackButton = styled.a`
  cursor: pointer;
  color: #374151;
  text-align: center;
  margin-top: 1rem;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  background-color: #f9fafb;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
  :not(:last-child) {
    border-bottom-width: 1px;
    border-color: #d2d6dc;
    border-bottom-style: dashed;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    @media (max-width: 768px) {
      font-size: 0.8rem !important;
    }
    font-weight: 400 !important;
  }
`;

const ContentHorizontal = styled(Content)`
  display: flex;
  width: 100%;

  .link {
    color: #5145cd;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 400;
    cursor: pointer;
  }
`;

const SignBox = styled.div`
  margin-top: 3rem;
  * {
    margin-bottom: 3rem;
  }
`;

const Info = styled.div`
  margin: 2rem;
  @media (max-width: 768px) {
    margin: 0;
  }
  margin-top: 0;
  font-style: italic;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 400;
  span {
    font-style: normal;
    color: #000;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    :hover {
      color: #5145cd;
    }
  }
  li {
    margin: 0.5rem;
  }
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const Title = styled.div`
  position: relative;
  text-align: center;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 700;
  margin: 1rem 0;
  ::after {
    content: "";
    display: block;
    height: 1px;
    width: 100%;
    background-color: #d2d6dc;
    position: absolute;
    left: 0;
    top: 50%;
    @media (max-width: 768px) {
      top: 110%;
    }
    transform: translateY(-50%);
    z-index: -1;
  }
  span {
    padding: 0 10px;
    background-color: #fff;
    color: rgb(22, 30, 46);
  }
`;

const ConsentementBox = styled.div`
  width: 60%;
  padding: 3rem;
  border-radius: 8px;
  margin: auto;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
    width: 100%;
    padding: 1rem;
  }
  .noPrint {
    @media print {
      display: none;
    }
  }
  .onlyPrint {
    display: none;
    @media print {
      display: block;
    }
  }
  @media print {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    padding: 2rem;
    z-index: 999;
  }
`;

const FormGroup = styled.div`
  width: 100%;
  margin-bottom: 25px;
  label {
    font-size: 1rem;
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  textarea,
  input {
    display: block;
    width: 100%;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

const FormRow = styled(Row)`
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  margin-bottom: 15px;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 1.25rem;
    width: 16px;
    height: 16px;
  }
  label {
    color: #4b5563;
    font-size: 1rem;
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
    width: 100%;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;
