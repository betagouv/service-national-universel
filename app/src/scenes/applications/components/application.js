import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Draggable } from "react-beautiful-dnd";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { translate, APPLICATION_STATUS_COLORS, APPLICATION_STATUS, getAge, SENDINBLUE_TEMPLATES } from "../../../utils";
import Badge from "../../../components/Badge";
import DomainThumb from "../../../components/DomainThumb";
import DownloadContractButton from "../../../components/buttons/DownloadContractButton";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default ({ application, index }) => {
  const [value, setValue] = useState(application);
  const [contract, setContract] = useState(null);
  const young = useSelector((state) => state.Auth.young);

  const getTags = (mission) => {
    if (!mission) return [];
    const tags = [];
    mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
    mission.domains && mission.domains.forEach((d) => tags.push(d));
    return tags;
  };

  useEffect(() => {
    const getContract = async () => {
      if (application.contractId) {
        const { ok, data, code } = await api.get(`/contract/${application.contractId}`);
        if (!ok) return toastr.error("Oups, une erreur est survenue", code);
        setContract(data);
      }
    };
    getContract();
  }, [application]);

  const contractHasAllValidation = (contract, young) => {
    const isYoungAdult = getAge(young.birthdateAt) >= 18;
    return (
      contract.projectManagerStatus === "VALIDATED" &&
      contract.structureManagerStatus === "VALIDATED" &&
      ((isYoungAdult && contract.youngContractStatus === "VALIDATED") ||
        (!isYoungAdult && contract.parent1Status === "VALIDATED" && (!young.parent2Email || contract.parent2Status === "VALIDATED")))
    );
  };

  if (!value || !value.mission) return <div />;

  return (
    <Draggable draggableId={value._id} index={index}>
      {(provided) => (
        <Container ref={provided.innerRef} {...provided.draggableProps}>
          <Header {...provided.dragHandleProps}>{value.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "PROPOSITION" : `CHOIX N°${index + 1}`}</Header>
          <Separator />
          <Card>
            <Col md={7}>
              <Link to={`/mission/${value.mission._id}`}>
                <div className="info">
                  <div className="inner">
                    <DomainThumb domain={value.mission.domains[0]} size="3rem" />
                    <div>
                      <h4>{value.mission.structureName}</h4>
                      <p>{value.mission.name}</p>
                      <Tags>
                        {getTags(value.mission).map((e, i) => e && <Badge key={i} text={e} textColor="#6b7280" backgroundColor="#ffffff" />)}
                        {value.mission.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" color="#03224C" /> : null}
                      </Tags>
                    </div>
                  </div>
                </div>
              </Link>
            </Col>
            <Col md={5}>
              <TagContainer>
                <Tag color={APPLICATION_STATUS_COLORS[value.status]}>{translate(value.status)}</Tag>
                <StatusComment>La mission a été annulée</StatusComment>
              </TagContainer>
            </Col>
          </Card>
          {contract && contract?.invitationSent && (
            <>
              <hr />
              {contractHasAllValidation(contract, young) ? (
                <div style={{ marginLeft: "1rem", fontSize: "0.9rem", fontWeight: "500", marginBottom: "1rem" }}>
                  <ContractInfoContainer>
                    <DownloadContractButton children={"Télécharger le contrat"} young={young} uri={contract._id} />
                  </ContractInfoContainer>
                </div>
              ) : (
                <ContractInfo contract={contract} young={young} />
              )}
            </>
          )}
          <Footer
            application={value}
            tutor={value.tutor}
            onChange={(e) => {
              setValue({ ...value, ...e });
            }}
          />
        </Container>
      )}
    </Draggable>
  );
};

function ContractInfo({ contract, young }) {
  const isYoungAdult = getAge(young.birthdateAt) >= 18;
  return (
    <>
      <div style={{ marginLeft: "1rem", fontSize: "0.9rem", fontWeight: "500" }}>Signatures du contrat d'engagement de la mission d'intérêt général</div>
      <ContractInfoContainer>
        <ContractStatus contract={contract} property="projectManagerStatus" name="Représentant de l'Etat" />
        <ContractStatus contract={contract} property="structureManagerStatus" name="Représentant structure" />
        {isYoungAdult ? (
          <ContractStatus contract={contract} property="youngContractStatus" name="Volontaire" />
        ) : (
          <>
            <ContractStatus contract={contract} property="parent1Status" name="Représentant légal 1" />
            {young.parent2Email && <ContractStatus contract={contract} property="parent2Status" name="Représentant légal 2" />}
          </>
        )}
      </ContractInfoContainer>
    </>
  );
}

const ContractStatus = ({ contract, property, name }) => (
  <ContainerFooter>
    <div style={{ display: "flex" }}>
      {contract?.invitationSent === "true" ? (
        <MinBadge color={contract[property] === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION} />
      ) : (
        <MinBadge />
      )}
      <span> {name} </span>
    </div>
  </ContainerFooter>
);

const Footer = ({ application, tutor, onChange }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const setStatus = async (status) => {
    try {
      const { data } = await api.put(`/application`, { _id: application._id, status });
      let template;
      if (status === APPLICATION_STATUS.ABANDON) template = SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION;
      if (status === APPLICATION_STATUS.CANCEL) template = SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION;
      if (status === APPLICATION_STATUS.WAITING_VALIDATION) template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION;
      if (template) await api.post(`/application/${application._id}/notify/${template}`);
      onChange(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getFooter = (status) => {
    if (status === APPLICATION_STATUS.VALIDATED) {
      return (
        <>
          <Separator />
          <ContainerFooter>
            {tutor ? (
              <>
                <div>
                  Tuteur : {tutor.firstName} {tutor.lastName}
                </div>
                {tutor.phone ? <div>Tél : {tutor.phone}</div> : null}
                <div>Mail : {tutor.email}</div>
              </>
            ) : null}
            <div
              onClick={() =>
                setModal({
                  isOpen: true,
                  title: `Abandonner la mission "${application.missionName}"`,
                  message:
                    "Êtes vous sûr de vouloir modifier cette candidature ?\nAttention cette action est irréversible, vous ne pourrez pas de nouveau candidater à cette mission.",
                  onConfirm: () => setStatus(APPLICATION_STATUS.ABANDON),
                })
              }
            >
              Abandonner la mission
            </div>
          </ContainerFooter>
          {/* <div onClick={() => setStatus(APPLICATION_STATUS.WAITING_VALIDATION)}>test</div> */}
        </>
      );
    } else if (status === APPLICATION_STATUS.WAITING_VALIDATION) {
      return (
        <>
          <Separator />
          <ContainerFooter>
            <div
              onClick={() =>
                setModal({
                  isOpen: true,
                  title: `Annuler la candidature à la mission "${application.missionName}"`,
                  message:
                    "Êtes vous sûr de vouloir modifier cette candidature ?\nAttention cette action est irréversible, vous ne pourrez pas de nouveau candidater à cette mission.",
                  onConfirm: () => setStatus(APPLICATION_STATUS.CANCEL),
                })
              }
            >
              Annuler cette candidature
            </div>
          </ContainerFooter>
        </>
      );
    } else if (status === APPLICATION_STATUS.WAITING_ACCEPTATION) {
      return (
        <>
          <Separator />
          <ContainerFooter>
            <div
              onClick={() =>
                setModal({
                  isOpen: true,
                  title: `Décliner la proposition de mission "${application.missionName}"`,
                  message: "Êtes vous sûr de vouloir décliner cette offre ?\nAttention cette action est irréversible, vous ne pourrez pas de nouveau candidater à cette mission.",
                  onConfirm: () => setStatus(APPLICATION_STATUS.CANCEL),
                })
              }
            >
              Décliner cette proposition
            </div>
            <div
              onClick={() =>
                setModal({
                  isOpen: true,
                  title: `Accepter la proposition de mission "${application.missionName}"`,
                  message: "Êtes vous sûr de vouloir accepter cette offre ?",
                  onConfirm: () => setStatus(APPLICATION_STATUS.WAITING_VALIDATION),
                })
              }
            >
              Accepter cette proposition
            </div>
          </ContainerFooter>
        </>
      );
    }
    return null;
  };

  return (
    <>
      {getFooter(application.status)}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};

const ContractInfoContainer = styled.div`
  display: flex;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const MinBadge = styled.span`
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${({ color }) => color || "#777"};
`;

const ContainerFooter = styled.div`
  display: flex;
  padding: 0.7rem;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 0;
  }
  div {
    cursor: pointer;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 0.2rem;
    padding: 5px 15px;
    margin: 0 0.5rem;
    font-size: 12px;
    font-weight: 500;
    @media (max-width: 768px) {
      margin: 0.4rem;
    }
  }
`;

const Tag = styled.span`
  color: ${({ color }) => color || "#42389d"};
  background-color: ${({ color }) => `${color}11` || "#42389d22"};
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  font-size: 0.85rem;
  @media (max-width: 768px) {
    margin-top: 1rem;
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const Separator = styled.hr`
  /* margin: 0 2.5rem; */
  height: 1px;
  margin: 0;
  border-style: none;
  background-color: #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.7rem;
  letter-spacing: 0.05rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  :hover {
    background-color: #f7f7f7;
  }
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  margin: 1rem 0;
`;

const Card = styled(Row)`
  padding: 1.5rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .info {
    justify-content: space-between;
  }
  .inner {
    display: flex;
    align-items: flex-start;
    h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 3px;
      color: #6b7280;
      text-transform: uppercase;
    }
    p {
      color: #161e2e;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 0;
    }
  }
`;

const TagContainer = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const Tags = styled(Row)`
  display: flex;
  align-items: center;
  margin-top: 0.8rem;
  div {
    text-transform: uppercase;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 5px 15px;
    margin-right: 15px;
    margin-bottom: 5px;
    font-size: 12px;
    font-weight: 500;
  }
`;

const StatusComment = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
  padding-top: 0.2rem;
`;
