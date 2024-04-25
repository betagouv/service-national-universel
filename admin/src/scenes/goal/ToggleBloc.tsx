import React, { ReactElement } from "react";
import { Row } from "reactstrap";
import styled from "styled-components";

import CrossSVG from "@/assets/cross.svg";
import PlusSVG from "@/assets/plus.svg";

interface Props {
  title: string | ReactElement;
  borderBottom?: boolean;
  borderRight?: boolean;
  borderLeft?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  visible?: boolean;
  children: ReactElement | ReactElement[];
}

export default function ToggleBloc({ children, title, borderBottom, borderRight, borderLeft, disabled, onClick, visible }: Props) {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}>
      <Wrapper>
        <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <Legend>{title}</Legend>
          <div>
            <Icon src={visible ? CrossSVG : PlusSVG} />
          </div>
        </div>
        <div style={{ display: visible ? "block" : "none" }}>{children}</div>
      </Wrapper>
    </Row>
  );
}

const Wrapper = styled.div`
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  background-color: white;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
    margin-top: 1rem;
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  font-size: 1.3rem;
  font-weight: 500;
`;

const Icon = styled.img`
  height: 18px;
  font-size: 18px;
  cursor: pointer;
`;
