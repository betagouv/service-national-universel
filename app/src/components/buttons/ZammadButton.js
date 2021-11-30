import React, { useEffect } from "react";
import styled from "styled-components";

//! À supprimer dans une autre PR maintenant qu'on a le formulaire maison

const ZammadButton = () => {
  useEffect(() => {
    if (!window || !window.$) return;

    console.log(window.$("#feedback-form"));

    window.$(function () {
      window.$("#feedback-form").ZammadForm({
        messageTitle: "Formulaire Besoin d'aide",
        messageSubmit: "Envoyer",
        messageThankYou: "Merci pour votre message  (#%s) ! Nous vous recontacterons dans les meilleurs délais.",
        modal: true,
      });
    });
  }, [window?.$]);
  return <LinkButton id="feedback-form">Contacter quelqu&apos;un</LinkButton>;
};

export default ZammadButton;

const LinkButton = styled.button`
  max-width: 230px;
  margin: 0.3rem;
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.3s;
  :hover {
    color: #fff;
    background: #463bad;
  }
`;
