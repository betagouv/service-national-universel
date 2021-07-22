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


  return (
    <div>
      <section>{JSON.stringify(young)}</section>
      <button
        onClick={() => {
          fetch('http://92.222.24.89/api/v1/users', {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer t2t18-3PuTGA_SWqVBrzwAzWQCN8Obd2G0s58OCK-yE6cnrdHGcyZwQQbQvUdFVm` },
          })
        }
        }
      >Ouvrir un ticket</button>
      <button>Accéder à mes tickets</button>
    </div>
  )
}
