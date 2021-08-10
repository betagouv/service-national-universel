import React, { useState, useEffect } from "react";
import { Row } from "reactstrap";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate as t, APPLICATION_STATUS_COLORS, SENDINBLUE_TEMPLATES } from "../../../utils";
import Badge from "../../../components/Badge";
import { Box, BoxTitle, Separator } from "../../../components/box";
import DownloadButton from "../../../components/buttons/DownloadButton";
import api from "../../../services/api";
import LoadingButton from "../../../components/buttons/LoadingButton";
import Loader from "../../../components/Loader";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import { adminURL, appURL } from "../../../config";

export default ({ young }) => {
  const [applicationsToMilitaryPreparation, setApplicationsToMilitaryPreparation] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, template: null, data: null });
  const history = useHistory();

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) return toastr.error("Oups, une erreur est survenue", code);
    return setApplicationsToMilitaryPreparation(data.filter((a) => a.mission.isMilitaryPreparation === "true"));
  };

  if (!applicationsToMilitaryPreparation) return <Loader />;

  if (!["WAITING_VALIDATION", "VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles)) {
    // display nothing if the young has not validated the files at least one time
    return null;
  }

  const handleValidate = () => {
    console.log("handleValidate");
    setModal({ isOpen: true, template: "confirm" });
  };
  const onValidate = async () => {
    console.log("onValidate");
    try {
      // validate the files
      const responseYoung = await api.put(`/referent/young/${young._id}`, { statusMilitaryPreparationFiles: "VALIDATED" });
      if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

      // change status of applications
      for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
        const app = applicationsToMilitaryPreparation[i];
        const responseApplication = await api.put("/application", { _id: app._id, status: "WAITING_VALIDATION" });
        if (!responseApplication.ok)
          toastr.error(
            translate(responseApplication.code),
            `Une erreur s'est produite lors du changement automatique de statut de la candidtature à la mission : ${app.missionName}`
          );
      }
      setModal({ isOpen: false, template: null, data: null });
      await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_VALIDATED}`);
      for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
        const app = applicationsToMilitaryPreparation[i];
        await api.post(`/referent/${app.tutorId}/email/${SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED}`, { app });
      }
    } catch (e) {
      console.error(e);
      toastr.error("Une erreur est survenue", t(e.code));
    }
    //Refresh
    history.go(0);
  };

  const handleCorrection = () => {
    console.log("handleCorrection");
    setModal({ isOpen: true, template: "correction" });
  };
  const onCorrection = async (message) => {
    console.log("onCorrection");

    // update the young
    const responseYoung = await api.put(`/referent/young/${young._id}`, { statusMilitaryPreparationFiles: "WAITING_CORRECTION" });
    if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

    // change status of applications if its not already correct
    for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
      const app = applicationsToMilitaryPreparation[i];
      if (app.status === "WAITING_VERIFICATION") continue;
      const responseApplication = await api.put("/application", { _id: app._id, status: "WAITING_VERIFICATION" });
      if (!responseApplication.ok)
        toastr.error(
          translate(responseApplication.code),
          `Une erreur s'est produite lors du changement automatique de statut de la candidtature à la mission : ${app.missionName}`
        );
    }
    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION}`, { message });
    toastr.success("Email envoyé !");
    setModal({ isOpen: false, template: null, data: null });
    // Refresh
    history.go(0);
  };

  const handleRefused = () => {
    console.log("handleRefused");
    setModal({ isOpen: true, template: "refuse" });
  };

  const onRefuse = async (message) => {
    console.log("onRefuse");

    // update the young
    const responseYoung = await api.put(`/referent/young/${young._id}`, { statusMilitaryPreparationFiles: "REFUSED" });
    if (!responseYoung.ok) return toastr.error(translate(responseYoung.code), "Une erreur s'est produite lors de la validation des documents");

    // change status of applications if its not already correct
    for (let i = 0; i < applicationsToMilitaryPreparation.length; i++) {
      const app = applicationsToMilitaryPreparation[i];
      if (app.status === "REFUSED") continue;
      const responseApplication = await api.put("/application", { _id: app._id, status: "REFUSED" });
      if (!responseApplication.ok)
        toastr.error(
          translate(responseApplication.code),
          `Une erreur s'est produite lors du changement automatique de statut de la candidtature à la mission : ${app.missionName}`
        );
    }
    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_REFUSED}`, { message });
    toastr.success("Email envoyé !");
    setModal({ isOpen: false, template: null, data: null });
    // Refresh
    history.go(0);
  };

  return (
    <>
      <ModalConfirm
        isOpen={modal.isOpen && modal.template === "confirm"}
        topTitle="alerte"
        title={`Vous êtes sur le point de confirmer l'éligibilité de ${young.firstName} à la préparation militaire, sur la base des documents reçus.`}
        message={`Une fois l'éligibilité confirmée un mail sera envoyé à ${young.firstName} (${young.email}).`}
        onCancel={() => setModal({ isOpen: false, template: null, data: null })}
        onConfirm={onValidate}
      />
      <ModalConfirmWithMessage
        isOpen={modal.isOpen && modal.template === "correction"}
        topTitle="alerte"
        title={`Attention, vous êtes sur le point de demander des corrections aux documents envoyés, car ces derniers ne vous permettent pas de confirmer ou d'infirmer l'éligibilité de ${young.firstName} à la préparation militaire`}
        message={`Une fois le message ci-dessous validé, il sera transmis par mail à ${young.firstName} (${young.email}).`}
        young={young}
        onChange={() => setModal({ isOpen: false, template: null, data: null })}
        onConfirm={onCorrection}
      />
      <ModalConfirmWithMessage
        isOpen={modal.isOpen && modal.template === "refuse"}
        topTitle="alerte"
        title={`Attention, vous êtes sur le point d'infirmer l'éligibilité de ${young.firstName} à la préparation militaire, sur la base des documents reçus.`}
        message={`Merci de motiver votre refus au jeune en lui expliquant sur quelle base il n'est pas éligible à la préparation militaire. Une fois le message ci-dessous validé, il sera transmis par mail à ${young.firstName} (${young.email}).`}
        young={young}
        onChange={() => setModal({ isOpen: false, template: null, data: null })}
        onConfirm={onRefuse}
      />
      <Box>
        <Bloc
          title="Documents - Préparation militaire"
          titleRight={<Badge text={t(young.statusMilitaryPreparationFiles)} color={APPLICATION_STATUS_COLORS[young.statusMilitaryPreparationFiles]} />}
        >
          {applicationsToMilitaryPreparation.map((a, i) => (
            <div key={i}>
              <LinkStyled href={`/mission/${a.missionId}`} target="_blank">
                {a?.mission?.name || a.missionName}
              </LinkStyled>
              <Badge text={t(a.status)} color={APPLICATION_STATUS_COLORS[a.status]} />
            </div>
          ))}
          <Line>
            {(young.militaryPreparationFilesIdentity || []).map((e, i) => (
              <DownloadButton
                key={i}
                source={() => api.get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesIdentity/${e}`)}
                title={`Télécharger la pièce d'identité (${i + 1}/${young.militaryPreparationFilesIdentity.length})`}
              />
            ))}
          </Line>
          <Line>
            {(young.militaryPreparationFilesCensus || []).map((e, i) => (
              <DownloadButton
                key={i}
                source={() => api.get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesCensus/${e}`)}
                title={`Télécharger l'attestation de recensement (${i + 1}/${young.militaryPreparationFilesCensus.length})`}
              />
            ))}
          </Line>
          <Line>
            {(young.militaryPreparationFilesAuthorization || []).map((e, i) => (
              <DownloadButton
                key={i}
                source={() => api.get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesAuthorization/${e}`)}
                title={`Télécharger l'autorisation parentale pour effectuer une préparation militaire (${i + 1}/${young.militaryPreparationFilesAuthorization.length})`}
              />
            ))}
          </Line>
          <Line>
            {(young.militaryPreparationFilesCertificate || []).map((e, i) => (
              <DownloadButton
                key={i}
                source={() => api.get(`/referent/youngFile/${young._id}/military-preparation/militaryPreparationFilesCertificate/${e}`)}
                title={`Télécharger le certificat médical de non contre indication à la pratique sportive  (${i + 1}/${young.militaryPreparationFilesCertificate.length})`}
              />
            ))}
          </Line>
          <Separator />
          <div style={{ display: "flex" }}>
            <LoadingButton color="#5245cc" textColor="#fff" onClick={() => handleValidate()}>
              Valider
            </LoadingButton>
            <LoadingButton color="#f4f4f4" textColor="#444" onClick={() => handleCorrection()}>
              Demander correction
            </LoadingButton>
            <LoadingButton color="#f00" textColor="#fff" onClick={() => handleRefused()}>
              Refuser
            </LoadingButton>
          </div>
        </Bloc>
      </Box>
    </>
  );
};

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderLeft, disabled }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper
        style={{
          width: "100%",
        }}
      >
        <div style={{ display: "flex", width: "100%" }}>
          <BoxTitle>
            <div>{title}</div>
            <div>{titleRight}</div>
          </BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Line = styled.div`
  display: flex;
`;

const Wrapper = styled.div`
  padding: 3rem;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
    margin-top: 1rem;
  }
`;

const LinkStyled = styled.a`
  color: #5245cc !important;
  :hover {
    text-decoration: underline;
  }
`;
