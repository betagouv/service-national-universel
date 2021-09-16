import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import api from "../../services/api";
import { Hero, HeroContainer, Separator } from "../../components/Content";
import LoadingButton from "../../components/buttons/LoadingButton";

//! This component isn't finished.

export default () => {
  const fetchArticles = async () => {
    try {
      const response = await fetch("https://support.selego.co/smapi/young", {
        method: "GET"
      });
      if (!response.ok) return console.log('Request failed', response);
      console.log('My articles', response);
    } catch (error) {
      console.log(error);
    }
  }
  //const young = useSelector((state) => state.Auth.young);
  // const createTicket = async () => {
  //   try {
  //     await api.post("/support-center/ticket");
  //     toastr.success("Ticket créé");
  //   } catch (e) {
  //     console.log(e);
  //     toastr.error("Une erreur est survenue");
  //   }
  // }

  return (
    <HeroContainer>
      <Container>
        <section className="help-section">
          <h2>Besoin d'aide ?</h2>
          <p style={{ color: "#6B7280", }}>Vous rencontrez un problème technique ou souhaitez en savoir plus sur le SNU ? N'hésitez pas à consulter notre base de connaissance !</p>
          <LinkButton href="https://support.selego.co/help/fr-fr" target="_blank">
            Base de connaissance
          </LinkButton>
        </section>
        <Card>
          <div className="content">
            <h3>
              Quelques articles pour vous aider :
            </h3>
            <div className="division" style={{ borderBottom: "1px solid #E5E7EB", borderTop: "1px solid #E5E7EB" }}>
              <button onClick={fetchArticles}>
                Test
              </button>
              <br />
            </div>
          </div>
        </Card>
      </Container>
      {/* <List>
        <header className="header">
          <p>ID</p>
          <p>Sujet</p>
          <p className="text">
            Mise à jour
          </p>
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
      </List> */}
    </HeroContainer>
  )
}

const Container = styled.div`
  display: flex;
  .help-section {
    max-width: 400px;
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
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background-color: #F9FAFB;
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
    background-color: #F9FAFB;
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

const LinkButton = styled.a`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 12px 30px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.3s;
  :hover {
    color: #fff;
    background: #463bad;
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
    color: #6B7280;
  }
`
