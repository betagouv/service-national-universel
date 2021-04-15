import React from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { translate } from "../../../utils";

export default ({ mission, image }) => {
  if (!mission) return <div />;
  const tags = [];
  tags.push(mission.remote ? "À distance" : "En présentiel");
  mission.city && tags.push(mission.city);
  tags.push(translate(mission.domain));
  const handleClick = () => {
    window.lumiere("sendEvent", "click", "open_mission_phase3", { publisherName: mission.publisherName, title: mission.title, organizationName: mission.organizationName });
  };
  return (
    <Card>
      <Col md={8}>
        <div className="inner">
          <div className="thumb">
            <img src={image} />
          </div>
          <div>
            <h4>{mission.organizationName}</h4>
            <p>{mission.title}</p>
          </div>
        </div>
        <Tags>
          {tags.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </Tags>
      </Col>
      <Col md={4}>
        <Button onClick={handleClick} target="_blank" href={mission.applicationUrl}>
          Voir la mission sur <b>{mission.publisherName}</b>
          <img src={require("../../../assets/external-link.svg")} height={15} color="white" />
        </Button>
      </Col>
    </Card>
  );
};

const Card = styled(Row)`
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
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

const Button = styled.a`
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 13px;
  padding: 10px 15px 8px;
  margin: 0.5rem 0.5rem 0 0;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
  }
  img {
    margin-left: 0.5rem;
  }
`;

const Tags = styled(Row)`
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 0 15px;
  div {
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 5px 15px;
    margin-right: 15px;
    margin-bottom: 5px;
    font-size: 12px;
  }
`;
