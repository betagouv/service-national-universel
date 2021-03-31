import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { translate } from "../../../utils";

export default ({ mission, image }) => {
  if (!mission) return <div />;
  const tags = [];
  tags.push(mission.remote ? "À distance" : "En présentiel");
  mission.city && tags.push(mission.city);
  tags.push(translate(mission.domain));
  let n = "tset";
  return (
    <Card>
      <div>
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
      </div>
      <Button target="_blank" href={mission.applicationUrl}>
        Voir la mission sur <b>{mission.publisherName}</b>
        <img src={require("../../../assets/external-link.svg")} height={15} color="white" />
      </Button>
    </Card>
  );
};

const Card = styled.div`
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

const Button = styled.a`
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 13px;
  padding: 10px 15px 8px;
  margin-left: 10px;
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

const Tags = styled.div`
  display: flex;
  align-items: center;
  div {
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 5px 15px;
    margin-right: 15px;
    font-size: 12px;
  }
`;

const Location = styled.div`
  color: rgb(107, 114, 128);
  background: url(${require("../../../assets/location.svg")}) left center no-repeat;
  background-size: 22px;
  font-weight: 400;
  letter-spacing: 0.02em;
  padding-left: 32px;
  margin-bottom: 10px;
`;
