import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { useHistory, Link } from "react-router-dom";

import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate, SENDINBLUE_TEMPLATES, permissionPhase2 } from "../../utils";
import { HeroContainer, Hero, Content, SeparatorXS } from "../../components/Content";
import UploadCard from "./components/UploadCard";
import LoadingButton from "../../components/buttons/LoadingButton";
import AlertBox from "../../components/AlertBox";
import Loader from "../../components/Loader";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [applicationsToMilitaryPreparation, setApplicationsToMilitaryPreparation] = useState(null);
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();

  if (!young || !permissionPhase2(young)) history.push("/");

  useEffect(() => {
    getApplications();
  }, []);

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) return toastr.error("Oups, une erreur est survenue", code);
    const d = data.filter((a) => a.mission.isMilitaryPreparation === "true");
    console.log(d);
    return setApplicationsToMilitaryPreparation(d);
  };

  if (!applicationsToMilitaryPreparation) return <Loader />;

  const onClickSubmit = (values, actions) => {
    return setModal({
      isOpen: true,
      onConfirm: () => onSubmit(values),
      onCancel: () => {
        setModal({ isOpen: false, onConfirm: null });
        actions.setSubmitting(false);
      },
      title: "Demande de validation de dossier",
      message: "Je confirme avoir téléverser tous les documents demandés, et transmets mon dossier pour validation.",
    });
  };

  const onSubmit = async () => {
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
      const responseNotification = await api.post(`/application/notify/docs-military-preparation/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED}`);
      if (!responseNotification.ok) return toastr.error(translate(responseNotification.code), "Une erreur s'est produite lors de l'envoie de la notification.");
      toastr.success("Votre dossier a bien été transmis");
      history.push("/");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !");
    }
  };

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
        <Hero thumbImage="marine.jpg">
          <Content className="content">
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
            <p style={{ fontSize: "0.9rem" }}>
              Vous désirez découvrir les armées et leurs métiers ? Vous cherchez la camaraderie, de l’exigence, des rencontres ? Continuer d’apprendre et rencontrer des jeunes de
              tous horizons ? Vous êtes de nationalité française, vous avez 16 ans (révolus le 1er jour du stage choisi), vous n’avez pas de contre-indication médicale aux
              activités sportives ?
              <br />
              <br />
              Embarquez pour l’aventure en rejoignant une des missions d’intérêt général proposées par l’armée de terre, la marine nationale, l’armée de l’air et de l’espace, le
              service de santé des armées, le service du commissariat des armées et le service de l’énergie opérationnelle. Vous effectuerez une période militaire
              d’initiation-défense nationale qui <b>ne vous engagera à rien</b> mais vous permettra, si vous le souhaitez, de postuler plus tard pour un engagement dans l’active ou
              dans la réserve.
            </p>
            {referentManagerPhase2 ? (
              <>
                <SeparatorXS />
                <h2>Contactez votre référent pour plus d’informations</h2>
                {referentManagerPhase2?.firstName} {referentManagerPhase2?.lastName} -{" "}
                <StyledA href={`mailto:${referentManagerPhase2?.email}`}>{referentManagerPhase2?.email}</StyledA>
              </>
            ) : null}
          </Content>
        </Hero>
      </HeroContainer>
      {applicationsToMilitaryPreparation.length ? (
        <Formik initialValues={young} validateOnChange={false} validateOnBlur={false} onSubmit={onClickSubmit}>
          {({ values, handleChange, handleSubmit, errors, isSubmitting }) => (
            <>
              <AlertBox
                message="Les informations collectées dans le cadre d’une candidature de votre part pour effectuer une préparation militaire sont destinées à vérifier l’éligibilité de
                      votre demande : en effet, l’accès aux préparations militaires est soumis à des conditions prévues par l’article 2 de l’arrêté du 21 avril 2008 relatif aux
                      périodes militaires d'initiation ou de perfectionnement à la défense nationale paru au JORF n°0102 du 30 avril 2008. Les documents que vous téléversez sur
                      cette page sont destinés aux services académiques de votre département de résidence et aux référents des missions d’intérêt général / préparations militaires
                      auxquelles vous postulez. Ces pièces seront conservées jusqu’à l’examen de votre candidature et, si votre candidature est acceptée, jusqu’à la fin de la
                      préparation militaire que vous effectuerez. Sans la fourniture de ces pièces, l’éligibilité de votre candidature ne pourra pas être étudiée."
              />
              <SubmitComponent young={young} loading={isSubmitting} onClick={handleSubmit} errors={errors} />
              <CardsContainer>
                <UploadCard
                  errors={errors}
                  title="Pièce d'identité"
                  subTitle="Déposez ici la copie d’une pièce d’identité en cours de validité (CNI, passeport)."
                  values={values}
                  name="militaryPreparationFilesIdentity"
                  handleChange={handleChange}
                />
                <UploadCard
                  errors={errors}
                  title="Attestation de recensement"
                  subTitle="Déposez ici la copie de votre attestation de recensement."
                  subsubTitle="À défaut, à téléverser dès réception du document ou à apporter pour le 1er jour de la préparation militaire."
                  values={values}
                  name="militaryPreparationFilesCensus"
                  handleChange={handleChange}
                />
                <UploadCard
                  errors={errors}
                  title="Autorisation parentale pour effectuer une préparation militaire"
                  subTitle="Téléchargez puis téléversez le formulaire rempli par votre représentant légal consentant à votre participation à une préparation militaire."
                  values={values}
                  name="militaryPreparationFilesAuthorization"
                  handleChange={handleChange}
                  template="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Modele_d_autorisation_parentale.pdf"
                />
                <UploadCard
                  errors={errors}
                  title="Certificat médical de non contre indication à la pratique sportive"
                  subTitle="Téléchargez puis téléversez le formulaire rempli par votre médecin traitant certifiant l’absence de contre-indication à la pratique sportive."
                  values={values}
                  name="militaryPreparationFilesCertificate"
                  handleChange={handleChange}
                  template="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/certificat_medical.pdf"
                />
              </CardsContainer>
              <SubmitComponent young={young} loading={isSubmitting} onClick={handleSubmit} errors={errors} />
            </>
          )}
        </Formik>
      ) : (
        <NoResult>
          <p>Vous n&apos;avez candidaté à aucune préparation militaire.</p>
          <Link to="/mission">
            <Button>Trouver des préparations militaires</Button>
          </Link>
        </NoResult>
      )}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={modal?.onCancel}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

const SubmitComponent = ({ young, loading, onClick, errors }) => (
  <Footer>
    {!young.statusMilitaryPreparationFiles || young.statusMilitaryPreparationFiles === "WAITING_UPLOAD" ? (
      <LoadingButton loading={loading} onClick={onClick}>
        Demander la validation de mon dossier
      </LoadingButton>
    ) : null}
    {["WAITING_CORRECTION", "WAITING_VALIDATION"].includes(young.statusMilitaryPreparationFiles) ? (
      <LoadingButton loading={loading} onClick={onClick}>
        Mettre à jour et redemander la validation de mon dossier
      </LoadingButton>
    ) : null}
    {Object.keys(errors).length ? <h3>Vous ne pouvez pas envoyer votre dossier à vérifier car il manque des pièces requises.</h3> : null}
  </Footer>
);

const CardsContainer = styled.div`
  padding: 1rem;
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
`;

const Footer = styled.div`
  margin: 1rem;
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
const StyledA = styled.a`
  font-size: 1rem;
  color: #5145cd;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;
