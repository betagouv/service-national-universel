import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import api from "../../services/api";
import { Hero, HeroContainer, Separator } from "../../components/Content";
import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "../../utils";

// This component isn't finished.

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const createTicket = async () => {
    try {
      await api.post("/support-center/ticket");
      toastr.success("Ticket créé");
    } catch (e) {
      console.log(e);
      toastr.error("Une erreur est survenue");
    }
  };

  return (
    <HeroContainer>
      <Container>
        <section className="help-section">
          <h2>Besoin d'aide ?</h2>
          <p style={{ color: "#6B7280" }}>Vous avez un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l’un de vos référents ?</p>
          <LoadingButton>
            <Link to="/ticket">Contacter le support</Link>
          </LoadingButton>
        </section>
        <Card>
          <div className="content">
            <h3>Mes informations</h3>
            <p style={{ color: "#6B7280" }}>
              <span style={{ fontWeight: "700" }}>
                {young.firstName} {young.lastName}
              </span>{" "}
              • née le 27/11/2020 • Ile-de-France
            </p>
            <div className="division" style={{ borderBottom: "1px solid #E5E7EB", borderTop: "1px solid #E5E7EB" }}>
              <p>Centre de cohésion</p>
              <br />
              <p>{young.cohesionCenterName}</p>
            </div>
            <div className="division" style={{ borderBottom: "1px solid #E5E7EB" }}>
              <p>Phase 1</p>
              <p>{translate(young.statusPhase1)}</p>
            </div>
            <div className="division" style={{ borderBottom: "1px solid #E5E7EB" }}>
              <p>Phase 2</p>
              <p>{translate(young.statusPhase2)}</p>
            </div>
            <div className="division">
              <p>Phase 3</p>
              <p>{translate(young.statusPhase3)}</p>
            </div>
          </div>
        </Card>
      </Container>
      <List>
        <header className="header">
          <p>ID</p>
          <p>Sujet</p>
          <p className="text">Mise à jour</p>
        </header>
        <section className="section">
          <p>#4563</p>
          <p>Problème avec ma mission</p>
          <p className="text">Il y a une heure</p>
        </section>
        <section className="section background">
          <p>#4562</p>
          <p>Ma candidature a disparu</p>
          <p className="text">Il y a 2 jours</p>
        </section>
        <section className="section">
          <p>#4561</p>
          <p>Contact chef de centre</p>
          <p className="text">Il y a 4 jours</p>
        </section>
        <section className="section background">
          <p>#4560</p>
          <p>Informations mission</p>
          <p className="text">Il y a une semaine</p>
        </section>
      </List>
    </HeroContainer>
  );
};

const Container = styled.div`
  display: flex;
  .help-section {
    max-width: 450px;
    margin: 40px 20px;
  }
`;

const List = styled.div`
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
  background-color: #fff;
  overflow: hidden;
  :nth-child(2n + 1) {
    background-color: #f4f5f7;
  }
  .header {
    p {
      margin: 0;
    }
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background-color: #f9fafb;
  }
  .section {
    p {
      margin: 0;
    }
    display: flex;
    justify-content: space-between;
    padding: 15px;
  }
  .background {
    background-color: #f9fafb;
  }
  .text {
    width: 50%;
    display: flex;
    justify-content: flex-end;
  }
`;

const Link = styled(NavLink)`
  color: #fff;
  cursor: pointer;
  :hover {
    color: #fff;
  }
`;

const Card = styled.div`
  display: flex;
  flex: 2;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  flex-direction: column;
  background-color: #fff;
  .division {
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }
  .division p {
    margin: 0;
  }
  .division p:first-child {
    color: #6b7280;
  }
`;
