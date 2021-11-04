import React, { useEffect } from "react";

export default () => {
  useEffect(() => {
    if (!window || !window.$) return;

    console.log(window.$("#feedback-form"));

    window.$(function () {
      window.$("#feedback-form").ZammadForm({
        messageTitle: "Formulaire de Commentaire",
        messageSubmit: "Envoyer",
        messageThankYou: "Merci pour votre requête  (#%s) ! Nous vous recontacterons dans les meilleurs délais.",
        modal: true,
      });
    });
  }, [window?.$]);
  return <button id="feedback-form">Feedback</button>;
};
