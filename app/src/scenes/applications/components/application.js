import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Draggable } from "react-beautiful-dnd";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { translate, APPLICATION_STATUS_COLORS, APPLICATION_STATUS, getAge } from "../../../utils";

export default ({ application, index }) => {
  const [value, setValue] = useState(application);
  const [contract, setContract] = useState(null);
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

  if (!value || !value.mission) return <div />;

  return (
    <Draggable draggableId={value._id} index={index}>
      {(provided) => (
        <Container ref={provided.innerRef} {...provided.draggableProps}>
          <Header {...provided.dragHandleProps}>{value.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "PROPOSITION" : `CHOIX N°${index + 1}`}</Header>
          <Separator />
          <Card>
            <Col md={9}>
              <Link to={`/mission/${value.mission._id}`}>
                <div className="info">
                  <div className="inner">
                    <div className="thumb">
                      <img src={require("../../../assets/observe.svg")} />
                    </div>
                    <div>
                      <h4>{value.mission.structureName}</h4>
                      <p>{value.mission.name}</p>
                      <Tags>{getTags(value.mission).map((e, i) => e && <div key={i}>{translate(e)}</div>)}</Tags>
                    </div>
                  </div>
                </div>
              </Link>
            </Col>
            <Col md={3}>
              <TagContainer>
                <Tag color={APPLICATION_STATUS_COLORS[value.status]}>{translate(value.status)}</Tag>
              </TagContainer>
            </Col>
          </Card>
          {contract && contract?.invitationSent && <ContractInfo contract={contract} />}
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

function ContractInfo({ contract }) {
  const young = useSelector((state) => state.Auth.young);
  const isYoungAdult = getAge(young.birthdateAt) >= 18;

  return (
    <>
      <hr />
      <div>
        <span style={{ marginLeft: "1rem", fontSize: "0.9rem", fontWeight: "500" }}>Signatures du contrat d'engagement de la mission d'intérêt général</span>
        <div style={{ display: "flex" }}>
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
        </div>
      </div>
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
  const setStatus = async (status) => {
    try {
      if (!confirm("Êtes vous sûr de vouloir modifier cette candidature ?")) return;
      const { data } = await api.put(`/application`, { _id: application._id, status });
      await api.post(`/application/${application._id}/notify/${status.toLowerCase()}`);
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
            <div onClick={() => setStatus(APPLICATION_STATUS.ABANDON)}>Abandonner la mission</div>
          </ContainerFooter>
          {/* <div onClick={() => setStatus(APPLICATION_STATUS.WAITING_VALIDATION)}>test</div> */}
        </>
      );
    } else if (status === APPLICATION_STATUS.WAITING_VALIDATION) {
      return (
        <>
          <Separator />
          <ContainerFooter>
            <div onClick={() => setStatus(APPLICATION_STATUS.CANCEL)}>Annuler cette candidature</div>
          </ContainerFooter>
        </>
      );
    } else if (status === APPLICATION_STATUS.WAITING_ACCEPTATION) {
      return (
        <>
          <Separator />
          <ContainerFooter>
            <div onClick={() => setStatus(APPLICATION_STATUS.CANCEL)}>Décliner cette proposition</div>
            <div onClick={() => setStatus(APPLICATION_STATUS.WAITING_VALIDATION)}>Accepter cette proposition</div>
          </ContainerFooter>
        </>
      );
    }
    return null;
  };

  return getFooter(application.status);
};

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
  div {
    cursor: pointer;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 0.2rem;
    padding: 5px 15px;
    margin-right: 15px;
    font-size: 12px;
    font-weight: 500;
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
  :hover {
    background-color: #f7f7f7;
  }
  .inner {
    display: flex;
    align-items: flex-start;
    .thumb {
      margin-right: 20px;
      background-color: #42389d;
      height: 50px;
      width: 48px;
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      img {
        border-radius: 6px;
        max-width: 100%;
        height: 30px;
        object-fit: cover;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
    }
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
  justify-content: flex-end;
  @media (max-width: 768px) {
    justify-content: center;
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
