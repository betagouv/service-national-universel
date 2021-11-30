import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import QuestionMark from "../../assets/QuestionMark";

export default function HelpButton({ to, color }) {
  const Container = styled.div`
    margin: 0.5rem;
    justify-content: center;
    display: flex;
    .help-button {
      border: 1px solid #7786cf;
      border-radius: 0.3rem;
      padding: 0.5rem;
      align-items: center;
      display: flex;
      .icon {
        height: 1.5rem;
        width: 1.5rem;
        color: #7786cf;
        margin-right: 0.5rem;
      }
      .help-button-text {
        color: ${color ? color : "white"};
        text-align: center;
        .help-button-text-primary {
          font-weight: 400;
          font-size: 0.9rem;
        }
        .help-button-text-secondary {
          font-weight: 300;
          font-size: 0.6rem;
        }
      }
      :hover {
        background: #7786cf;
        cursor: pointer;
        .icon {
          color: #fff;
        }
      }
    }
  `;

  return (
    <Container>
      <NavLink className="help-button" to={to}>
        <QuestionMark className="icon" />
        <div className="help-button-text">
          <div className="help-button-text-primary">Besoin d&apos;aide ?</div>
          <div className="help-button-text-secondary">Tutoriels, contacts</div>
        </div>
      </NavLink>
    </Container>
  );
}
