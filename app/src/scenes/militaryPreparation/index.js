import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { useHistory, Link } from "react-router-dom";

import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate } from "../../utils";
import { HeroContainer, Hero, Content, SeparatorXS } from "../../components/Content";
import UploadCard from "./components/UploadCard";
import LoadingButton from "../../components/buttons/LoadingButton";
import AlertBox from "../../components/AlertBox";
import Loader from "../../components/Loader";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();

  const [applicationsToMilitaryPreparation, setApplicationsToMilitaryPreparation] = useState(null);

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/application/young/${young._id}`);
    if (!ok) return toastr.error("Oups, une erreur est survenue", code);
    const d = data.filter((a) => a.mission.isMilitaryPreparation === "true");
    console.log(d);
    return setApplicationsToMilitaryPreparation(d);
  };

  if (!applicationsToMilitaryPreparation) return <Loader />;

  return (
    <>
      {young.statusMilitaryPreparationFiles === "WAITING_VALIDATION" ? (
        <AlertBox
          title="Votre dossier est en cours de vérification par nos équipes."
          message={`Vous serez notifié par email à l'adresse ${young.email} dès qu'il y aura du nouveau !`}
        />
      ) : null}
      {young.statusMilitaryPreparationFiles === "WAITING_CORRECTION" ? (
        <AlertBox
          title="Votre dossier est incomplet et/ou invalide"
          message={`Vous avez reçu un email à l'adresse ${young.email} indiquant les pièces bloquantes. Merci de retéléverser des documents valides. N'oubliez pas de valider vos changements !`}
        />
      ) : null}
      {young.statusMilitaryPreparationFiles === "REFUSED" ? (
        <AlertBox title="Votre dossier a été refusé." message={`Vous avez reçu un email à l'adresse ${young.email} indiquant les pièces bloquantes.`} />
      ) : null}
      <HeroContainer>
        <Hero>
          <Content>
            <h1>Réalisez votre mission lors d’une préparation militaire</h1>
            <p>Une période de découverte du milieu militaire pour vivre durant quelques jours le quotidien d’un soldat. </p>
          </Content>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <HeroContainer>
        <Hero>
          <Content style={{ width: "100%" }}>
            <h2>Quelques mots au sujet de la préparation militaire</h2>
            <p>
              L'inscription à cette préparation est bien évidemment basée sur le volontariat. Cette période en immersion vous permettra d'avoir une excellente première approche,
              afin de tester votre motivation à faire carrière ou non dans l'armée.{" "}
            </p>
            {/* <SeparatorXS />
            <h2>Contactez votre référent pour plus d’informations</h2>
            <a>Michel Cymes - mcymes@toulouse.fr</a> */}
          </Content>
        </Hero>
      </HeroContainer>
      {applicationsToMilitaryPreparation.length ? (
        <Formik
          initialValues={young}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { ok, code, data: young } = await api.put("/young", { statusMilitaryPreparationFiles: "WAITING_VALIDATION" });
              if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
              dispatch(setYoung(young));
              for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
                const app = applicationsToMilitaryPreparation[i];
                if (app.status === "WAITING_VERIFICATION") continue;
                const responseApplication = await api.put("/application", { _id: app._id, status: "WAITING_VERIFICATION" });
                if (!responseApplication.ok) toastr.error(translate(responseApplication.code), "Une erreur s'est produite lors du traitement");
              }
              toastr.success("Votre dossier a bien été transmis");
              history.push("/");
            } catch (e) {
              console.log(e);
              toastr.error("Erreur !");
            }
          }}
        >
          {({ values, handleChange, handleSubmit, errors, isSubmitting }) => (
            <>
              <CardsContainer>
                <Row>
                  <Col md={6} xs={12} style={{ paddingBottom: "15px" }}>
                    <UploadCard
                      errors={errors}
                      title="Pièce d'identité"
                      subTitle="Déposez ici la copie d’une pièce d’identité en cours de validité (CNI, passeport)."
                      values={values}
                      name="militaryPreparationFilesIdentity"
                      handleChange={handleChange}
                    />
                  </Col>
                  <Col md={6} xs={12} style={{ paddingBottom: "15px" }}>
                    <UploadCard
                      errors={errors}
                      title="Attestation de recensement"
                      subTitle="Déposez ici la copie de votre attestation de recensement."
                      values={values}
                      name="militaryPreparationFilesCensus"
                      handleChange={handleChange}
                    />
                  </Col>
                  <Col md={6} xs={12} style={{ paddingBottom: "15px" }}>
                    <UploadCard
                      errors={errors}
                      title="Autorisation parentale pour effectuer une préparation militaire"
                      subTitle="Téléchargez puis téléversez le formulaire rempli par votre représentant légal consentant à votre participation à une préparation militaire."
                      values={values}
                      name="militaryPreparationFilesAuthorization"
                      handleChange={handleChange}
                    />
                  </Col>
                  <Col md={6} xs={12} style={{ paddingBottom: "15px" }}>
                    <UploadCard
                      errors={errors}
                      title="Certificat médical de non contre indication à la pratique sportive"
                      subTitle="Téléchargez puis téléversez le formulaire rempli par votre médecin traitant certifiant l’absence de contre-indication à la pratique sportive."
                      values={values}
                      name="militaryPreparationFilesCertificate"
                      handleChange={handleChange}
                    />
                  </Col>
                </Row>
                <Footer>
                  {!young.statusMilitaryPreparationFiles ? (
                    <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
                      Valider mon dossier
                    </LoadingButton>
                  ) : null}
                  {["WAITING_CORRECTION", "WAITING_VALIDATION"].includes(young.statusMilitaryPreparationFiles) ? (
                    <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
                      Mettre à jour mon dossier
                    </LoadingButton>
                  ) : null}
                  {Object.keys(errors).length ? <h3>Vous ne pouvez pas envoyer votre dossier à vérifier car il manque des pièces requises.</h3> : null}
                </Footer>
              </CardsContainer>
            </>
          )}
        </Formik>
      ) : (
        <NoResult>
          <p>Vous n'avez candidaté à aucune préparation militaire.</p>
          <Link to="/mission">
            <Button>Trouver des préparations militaire</Button>
          </Link>
        </NoResult>
      )}
    </>
  );
};

const CardsContainer = styled.div`
  margin: 0 auto;
  max-width: 80rem;
`;

const Footer = styled.div`
  margin-bottom: 2rem;
  margin-top: 1rem;
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
const NoResult = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  p {
    color: #3d4151;
    font-size: 0.8rem;
    font-style: italic;
  }
`;
const Button = styled.div`
  width: fit-content;
  cursor: pointer;
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 1rem;
  padding: 0.8rem 3rem;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
  }
`;
