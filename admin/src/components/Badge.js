import React from "react";
import styled from "styled-components";

export default function DownloadButton({ text, tooltipText, minTooltipText, icon, minify = false, ...rest }) {
  return (
    <Badge minify={minify} {...rest}>
      <div className="flex items-center gap-1">
        {icon}
        <span>{text}</span>
      </div>
      <div className="tooltiptext">{tooltipText}</div>
      <div className="minTooltipText">{minTooltipText || tooltipText}</div>
    </Badge>
  );
}

const Badge = styled.div`
  position: relative;
  display: inline-block;
  padding: 0.25rem 1rem;
  margin: 0.25rem 0.25rem;
  border-radius: 99999px;
  font-size: 14px;
  line-height: 1.25rem;
  font-weight: 500;
  color: #9a9a9a;
  background-color: #f6f6f6;
  border: 1px solid #cecece;
  ${({ color, backgroundColor }) => `
    color: ${color};
    background-color: ${backgroundColor ? backgroundColor : `${color}11`};
    border: 1px solid ${color};
  `};
  /* Tooltip text */
  .minTooltipText,
  .tooltiptext {
    font-size: 0.75rem;
    visibility: hidden;
    ${({ color }) => `
      color: ${color};
    `};
    text-align: center;
    position: absolute;
    z-index: 1;
    width: 120px;
    bottom: 100%;
    left: 50%;
    margin-left: -60px; /* Use half of the width (120/2 = 60), to center the tooltip */
  }

  /* Show the tooltip text when you mouse over the tooltip container */
  :hover .tooltiptext {
    visibility: visible;
  }

  ${({ minify }) =>
    minify &&
    ` @media (max-width: 1100px) {
    width: 1.2rem;
    height: 1.2rem;
    padding: 0;
    span {
      display: none;
    }
    :hover .tooltiptext {
      visibility: hidden;
    }
    :hover .minTooltipText {
      visibility: visible;
    }
  }`}
`;
