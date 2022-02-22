import React from "react";
import styled from "styled-components";
import { Container } from "reactstrap";
import { Link } from "react-router-dom";

export default function MilitaryPreparationCard({ onClose, title, message }) {
  return (
    <Alert>
      <div className="text">
        <Link to="/ma-preparation-militaire">
          <strong>{title}</strong>
          <p>{message}</p>
        </Link>
      </div>
      {onClose ? <img src={require("../../../assets/close.svg")} height={15} width={15} onClick={onClose} style={{ cursor: "pointer" }} /> : null}
    </Alert>
  );
}

const Alert = styled(Container)`
  border-radius: 8px;
  display: flex;
  align-items: center;
  background: url(${require("../../../assets/pm.png")}) no-repeat right;
  background-size: cover;
  background-color: #fff;
  overflow: hidden;
  @media (max-width: 1000px) {
    ::after {
      background: rgb(255, 255, 255);
      box-shadow: 0 0 0 3000px rgb(255, 255, 255, 0.85);
      position: relative;
      height: fit-content;
      width: fit-content;
      content: "";
      left: 0;
      top: 0;
    }
  }
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 20px 30px;
  .text {
    z-index: 1;
    max-width: 50%;
    @media (max-width: 1000px) {
      max-width: 100%;
    }
    margin-left: 20px;
    margin-right: auto;
    margin-bottom: 0;
    strong {
      color: #161968;
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 3px;
    }
    p {
      color: #4d6d96;
      text-shadow: 1px 0 0 #fff, -1px 0 0 #fff, 0 1px 0 #fff, 0 -1px 0 #fff, 1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
      font-size: 1rem;
      font-weight: 500;
    }
  }
`;
