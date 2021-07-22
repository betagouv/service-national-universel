import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { HeroContainer } from "../../components/Content";
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
      <section>
        <h2>Besoin d'aide ?</h2>
        <p>Vous avec un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l’un de vos référents ?</p>
        <LoadingButton>
          <NavLink to="/support/ticket" className="">
            Contacter le support
          </NavLink>
        </LoadingButton>
      </section>

    </HeroContainer>
  )
}
