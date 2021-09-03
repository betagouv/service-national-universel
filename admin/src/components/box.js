import React from "react";
import styled from "styled-components";

export const Box = ({ children, ...rest }) => <BoxStyled {...rest}>{children}</BoxStyled>;

const BoxStyled = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  max-height: ${({ hide }) => (hide ? "20rem" : "none")};
  ${({ hide }) => (hide ? "overflow: hidden;" : "")};
  background-color: #fff;
  margin-bottom: 33px;
  border-radius: 8px;
`;

export const BoxContent = styled.div`
  label {
    font-weight: 500;
    color: #6a6f85;
    display: flex;
    margin-bottom: 0;
  }

  .detail {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 20px;
    font-size: 14px;
    text-align: left;
    &-title {
      min-width: 100px;
      width: 100px;
      margin-right: 5px;
    }
  }
  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }

  padding: 2rem;
  display: flex;
  flex-direction: ${(props) => props.direction};
  /* & > * {
    ${(props) => props.direction === "column" && ` margin-bottom: 25px;`}
  } */
`;

export const BoxHeadTitle = styled.h3`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
  color: #171725;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #f2f1f1;
  min-height: 5rem;
`;

export const BoxTitle = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 400;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const BoxTitleCircular = styled.h2`
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 18px;
  letter-spacing: 0.1px;
  color: #171725;
  margin: 1rem;
  margin-bottom: 0;
`;

export const Separator = styled.hr`
  margin: 1rem;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
