import React from "react";
import styled from "styled-components";

export default ({ text, textColor, backgroundColor, tooltipText, ...rest }) => {
  return (
    <Badge {...rest} textColor={textColor} backgroundColor={backgroundColor}>
      {text}
      <div className="tooltiptext">{tooltipText}</div>
    </Badge>
  );
};

const Badge = styled.div`
  position: relative;
  display: inline-block;
  padding: 0.25rem 1rem;
  margin: 0.25rem 0.25rem;
  border-radius: 99999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #9a9a9a;
  background-color: #f6f6f6;
  border: 1px solid #cecece;
  white-space: nowrap;
  height: fit-content;
  ${({ color, textColor, backgroundColor }) => `
    color: ${textColor || color};
    background-color: ${backgroundColor || `${color}33`};
    border: 1px solid ${textColor || color};
  `};
  /* Tooltip text */
  .tooltiptext {
    font-size: 0.75rem;
    visibility: hidden;
    ${({ color }) => `
      color: ${color};
    `};
    text-align: center;
    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
    width: 120px;
    bottom: 95%;
    left: 50%;
    margin-left: -60px; /* Use half of the width (120/2 = 60), to center the tooltip */
  }

  /* Show the tooltip text when you mouse over the tooltip container */
  :hover .tooltiptext {
    visibility: visible;
  }
`;
