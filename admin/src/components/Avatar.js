import React from "react";
import styled from "styled-components";

const getInitials = (word = "") => {
  const arr = word.toUpperCase().split(" ");
  return arr
    .reduce((acc, b) => (b[0] ? acc + b[0] : acc), "")
    .replace(/[^a-z0-9]/i, "")
    .substring(0, 3);
};

export default ({ name, logo, size = "medium", onClick }) => {
  if (!logo) {
    return (
      <Round size={size} onClick={onClick}>
        <div className="initials">{getInitials(name)}</div>
      </Round>
    );
  }
  return (
    <Round size={size} onClick={onClick}>
      <span>
        <img className="logo" src={logo} />
      </span>
    </Round>
  );
};

const Round = styled.div`
  width: ${({ size }) => {
    if (size === "small") return "30px;";
    return "40px;";
  }};
  height: ${({ size }) => {
    if (size === "small") return "30px;";
    return "40px;";
  }};
  min-width: ${({ size }) => {
    if (size === "small") return "30px;";
    return "40px;";
  }};
  min-height: ${({ size }) => {
    if (size === "small") return "30px;";
    return "40px;";
  }};
  font-size: ${({ size }) => {
    if (size === "small") return "11px;";
    return "14px;";
  }};
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  background: #ffffff;
  border: 4px solid #ce2027;
  font-weight: 700;
  color: #372f78;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
