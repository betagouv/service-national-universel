import React from "react";
import styled from "styled-components";

export default ({ sqSize = 70, strokeWidth = 3, percentage = 25, circleStrokeColor = "#ddd", circleProgressColor = "red", textColor = "black", title, subtitle }) => {
  // SVG centers the stroke width on the radius, subtract out so circle fits in square
  const radius = (sqSize - strokeWidth) / 2;
  // Enclose cicle in a circumscribing square
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2;
  // Scale 100% coverage overlay with the actual percent
  const dashOffset = dashArray - (dashArray * (isNaN(percentage) ? 0 : percentage)) / 100;

  return (
    <CircularProgressWrapper>
      <svg style={{ minWidth: sqSize, width: sqSize, height: sqSize }} viewBox={viewBox}>
        <CircleBackground circleStrokeColor={circleStrokeColor} cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} />
        <CircleProgress
          circleProgressColor={circleProgressColor}
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset }}
        />
        <Text textColor={textColor} x="50%" y="50%" dy=".3em" textAnchor="middle">
          {isNaN(percentage) ? `--` : `${percentage}%`}
        </Text>
      </svg>
      <CircularProgressTextContent>
        {title && <CircularProgressTitle>{title}</CircularProgressTitle>}
        {subtitle && <CircularProgressSubtitle>{subtitle}</CircularProgressSubtitle>}
      </CircularProgressTextContent>
    </CircularProgressWrapper>
  );
};

// CircularProgress
const CircularProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 40px;
`;
const CircularProgressTextContent = styled.div`
  margin-top: -6px;
  padding-left: 15px;
`;
const CircularProgressTitle = styled.h4`
  margin: 0;
  color: #171725;
  font-size: 16px;
  font-weight: bold;
`;
const CircularProgressSubtitle = styled.h5`
  margin: 0;
  font-size: 14px;
  color: #696974;
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: ${(props) => props.circleStrokeColor};
`;
const CircleProgress = styled.circle`
  fill: none;
  stroke: ${(props) => props.circleProgressColor};
  stroke-linecap: round;
  stroke-linejoin: round;
`;
const Text = styled.text`
  font-size: 16px;
  font-weight: bold;
  fill: ${(props) => props.textColor};
`;
