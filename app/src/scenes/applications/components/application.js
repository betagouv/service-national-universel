import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import api from "../../../services/api";
import { translate, APPLICATION_STATUS_COLORS, APPLICATION_STATUS } from "../../../utils";

export default ({ application, index }) => {
  const [value, setValue] = useState(application);
  const getTags = (mission) => {
    if (!mission) return [];
    const tags = [];
    mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
    mission.domains && mission.domains.forEach((d) => tags.push(d));
    return tags;
  };

  if (!value) return <div />;

  return (
    <Draggable draggableId={value._id} index={index}>
      {(provided) => (
        <Container ref={provided.innerRef} {...provided.draggableProps}>
          <Header {...provided.dragHandleProps}>{value.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "PROPOSITION" : `CHOIX N°${index + 1}`}</Header>
          <Separator />
          <Card to={`/mission/${value.mission._id}`}>
            <div className="info">
              <div className="inner">
                <div className="thumb">
                  <img src={require("../../../assets/observe.svg")} />
                </div>
                <div>
                  <h4>{value.mission.structureName}</h4>
                  <p>{value.mission.name}</p>
                  <Tags>
                    {getTags(value.mission).map((e, i) => (
                      <div key={i}>{e}</div>
                    ))}
                  </Tags>
                </div>
              </div>
            </div>
            <Tag color={APPLICATION_STATUS_COLORS[value.status]}>{translate(value.status)}</Tag>
          </Card>
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

const Card = styled(Link)`
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

const Tags = styled.div`
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
    font-size: 12px;
    font-weight: 500;
  }
`;
