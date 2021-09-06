import React from "react";
import styled from "styled-components";
import { Container } from "reactstrap";

export default ({ onClose, title, message }) => (
  <Alert>
    <img src={require("../assets/information.svg")} height={15} />
    <div className="text">
      <strong>{title}</strong>
      <div>{message}</div>
    </div>
    {onClose ? <img src={require("../assets/close.svg")} height={15} onClick={onClose} style={{ cursor: "pointer" }} /> : null}
  </Alert>
);

const Alert = styled(Container)`
  border-radius: 8px;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  display: flex;
  align-items: center;
  background-color: #5949d0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 10px 20px;
  .text {
    margin-left: 20px;
    margin-right: auto;
    margin-bottom: 0;
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    strong {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 3px;
    }
  }
`;
