import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import api from "../../services/api";
import { Hero, HeroContainer, Separator } from "../../components/Content";
import LoadingButton from "../../components/buttons/LoadingButton";

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
      <pre>{JSON.stringify(young)}</pre>
      <button
        onClick={createTicket}
      >Ouvrir un ticket</button>
      <Container>
        <section>
          <h2>Besoin d'aide ?</h2>
          <p>Vous avec un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l’un de vos référents ?</p>
          <LoadingButton>
            <Link to="/ticket" className="">
              Contacter le support
            </Link>
          </LoadingButton>
        </section>
        <Hero>
          <div className="content">
            <h3>
              Mes informations
            </h3>
            <p>
              <span>{young.firstName}</span> Né le {young.birthdateAt}
            </p>
            <Separator />
            <p>
              <span>Centre de cohésion</span>
              <br />
              <Link to="/mission">{young.cohesionCenter}</Link>
            </p>
            <Separator />
            <p>
              Phase 1
            </p>
            <Separator />
            <p>Phase 2</p>
          </div>
        </Hero>
      </Container>
      <List>
        <header className="header">
          <p>ID</p>
          <p>Sujet</p>
          <p className="text">
            Mise à jour
          </p>
        </header>
        <section className="section">
          <p>#4566</p>
          <p>Lorem ipsum dolor</p>
          <p className="text">Il y a un jour</p>
        </section>
        <section className="section">
          <p>#4566</p>
          <p>Lorem ipsum dolor</p>
          <p className="text">Il y a un jour</p>
        </section>
        <section className="section">
          <p>#4566</p>
          <p>Lorem ipsum dolor</p>
          <p className="text">Il y a un jour</p>
        </section>
      </List>
    </HeroContainer>
  )
}

const Container = styled.div`
  display: flex;
`;

const List = styled.div`
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
  padding: 10px 20px;
  background-color: #fff;
  :nth-child(2n + 1) {
    background-color: #f4f5f7;
  }
  .header {
    display: flex;
  }
  .section {
    display: flex;
  }
`;

const Link = styled(NavLink)`
  color: #fff;
  cursor: pointer;
  :hover {
    color: #fff;
  }
`;
