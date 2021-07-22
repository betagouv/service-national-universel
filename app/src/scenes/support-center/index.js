import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { toastr } from "react-redux-toastr";

import Loader from "../../components/Loader";
import api from "../../services/api";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const createTicket = async () => {
    try {
      await api.post("/support-center/ticket");
      toastr.success("Ticket créé");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur!");
    }
  };

  return (
    <div>
      <pre>{JSON.stringify(young)}</pre>
      <button onClick={createTicket}>Ouvrir un ticket</button>
      <button>Accéder à mes tickets</button>
    </div>
  );
};
