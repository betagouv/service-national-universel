import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";

export default ({ id, title, image, subtitle, tags = [], places, location, onClick, applied }) => {
  return (
    <>
      <Card>
        <Col md={8}>
          <Link to={`/mission/${id}`}>
            <div>
              <div className="inner">
                <div className="thumb">
                  <img src={image} />
                </div>
                <div>
                  <h4>{title}</h4>
                  <p>{subtitle}</p>
                  <Tags>
                    {tags.map((e, i) => (
                      <div key={i}>{e}</div>
                    ))}
                  </Tags>
                </div>
              </div>
              {location && <Location>{location}</Location>}
            </div>
          </Link>
        </Col>
        <Col md={4}>
          <ButtonContainer>
            {applied ? (
              <Button to={`/candidature`}>Voir la candidature</Button>
            ) : (
              <Button to={`/mission/${id}`}>
                {places} volontaire{places > 1 && "s"} recherché{places > 1 && "s"}
              </Button>
            )}
          </ButtonContainer>
        </Col>
      </Card>
    </>
  );
};

const Separator = styled.hr`
  margin: 0 2.5rem;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;

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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Button = styled(Link)`
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 13px;
  padding: 10px 15px 8px;
  white-space: nowrap;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
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

const Location = styled.div`
  color: rgb(107, 114, 128);
  background: url(${require("../../../assets/location.svg")}) left center no-repeat;
  background-size: 22px;
  font-weight: 400;
  letter-spacing: 0.02em;
  padding-left: 32px;
  margin-bottom: 10px;
`;
