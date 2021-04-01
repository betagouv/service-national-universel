import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Col, Row } from "reactstrap";

import { translate, YOUNG_STATUS_COLORS, formatStringDate } from "../../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const getTags = () => {
    const tags = [];
    young.phase3MissionDomain && tags.push(translate(young.phase3MissionDomain));
    young.phase3MissionStartAt && tags.push("Début : " + formatStringDate(young.phase3MissionStartAt));
    young.phase3MissionEndAt && tags.push("Fin : " + formatStringDate(young.phase3MissionEndAt));
    return tags;
  };

  if (!young) return <Loader />;

  return (
    <>
      <Separator />
      <Card>
        <Col md={10}>
          <div className="info">
            <div className="inner">
              <div className="thumb">
                <img src={require("../../../assets/observe.svg")} />
              </div>
              <div>
                <h4>{young.phase3StructureName}</h4>
                <p>{young.phase3MissionDescription}</p>
                <Tags>
                  {getTags().map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </Tags>
              </div>
            </div>
          </div>
        </Col>
        <Col md={2}>
          <Tag color={YOUNG_STATUS_COLORS[young.statusPhase3]}>{translate(young.statusPhase3)}</Tag>
        </Col>
      </Card>
      <Footer young={young} />
    </>
  );
};

const Footer = ({ young }) => (
  <>
    <Separator />
    <ContainerFooter>
      <div>
        Tuteur : {young.phase3TutorFirstName} {young.phase3TutorLastName}
      </div>
      {young.phase3TutorPhone ? <div>Tél : {young.phase3TutorPhone}</div> : null}
      <div>Mail : {young.phase3TutorEmail}</div>
    </ContainerFooter>
  </>
);

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
  white-space: nowrap;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const Separator = styled.hr`
  /* margin: 0 2.5rem; */
  height: 1px;
  margin-top: 1.5rem;
  border-style: none;
  background-color: #e5e7eb;
`;

const Card = styled(Row)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  .inner {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    .thumb {
      margin-right: 20px;
      background-color: #42389d;
      height: 50px;
      width: 50px;
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      @media (max-width: 768px) {
        height: 30px;
        width: 30px;
        margin-right: 10px;
      }
      img {
        border-radius: 6px;
        /* max-width: 100%; */
        height: 30px;
        width: 30px;
        @media (max-width: 768px) {
          height: 18px;
          width: 18px;
        }
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
  white-space: nowrap;
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
