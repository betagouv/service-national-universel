import React from "react";
import styled from "styled-components";

export default function AlertBox({ onClose, title, message, color = "#5949d0" }) {
  return (
    <Alert color={color}>
      <img src={require("../assets/information.svg")} height={15} width={15} />
      <div className="text">
        <strong>{title}</strong>
        <div>{message}</div>
      </div>
      {onClose ? <img src={require("../assets/close.svg")} height={15} width={15} onClick={onClose} style={{ cursor: "pointer" }} /> : null}
    </Alert>
  );
}

const Alert = styled.span`
  border-radius: 8px;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  display: flex;
  align-items: center;
  background-color: ${(props) => props.color};
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-right: 1rem;
  margin-left: 1rem;
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
