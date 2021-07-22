import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import api from "../../services/api";
import { Hero, HeroContainer } from "../../components/Content";
import LoadingButton from "../../components/buttons/LoadingButton";

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
            <Link to="/support/ticket" className="">
              Contacter le support
            </Link>
          </LoadingButton>
        </section>
        <Hero>
          <h3>Mes informations</h3>
          <p><span>{young.firstName}</span> Né le {young.birthdateAt}</p>
          <p>Centre de cohésion</p>
          <p>Phase 1</p>
          <p>Phase 1</p>
          <p>Phase 1</p>
        </Hero>
      </Container>
    </HeroContainer>
  )
}

const Container = styled.div`
  display: flex;
`;

const Link = styled(NavLink)`
  color: #fff;
  cursor: pointer;
  :hover {
    color: #fff;
  }
`;
