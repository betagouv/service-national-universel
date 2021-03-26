import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export default ({ title, image, subtitle, tags = [], places, location }) => {
  return (
    <Card>
      <div>
        <div className="inner">
          <div className="thumb">
            <img src={image} />
          </div>
          <div>
            <h4>{title}</h4>
            <p>{subtitle}</p>
          </div>
        </div>
        <Tags>
          {tags.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </Tags>
        {location && <Location>{location}</Location>}
      </div>
      <Button to="/phase3/une-missions">
        {places} volontaire{places > 1 && "s"} recherché{places > 1 && "s"}
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

const Button = styled(Link)`
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 13px;
  padding: 10px 15px 8px;
  margin-left: 10px;
  white-space: nowrap;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
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
