import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import { translate } from "../../../utils";
import CenterView from "./wrapper";
import api from "../../../services/api";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { Box, BoxTitle } from "../../../components/box";

export default function Team({ center }) {
  const [headCenter, setHeadCenter] = useState();
  useEffect(() => {
    (async () => {
      if (!center) return;
      const { ok, data, code } = await api.get(`/cohesion-center/${center._id}/head`);
      if (!ok) {
        setHeadCenter(null);
        toastr.error("Oups, une erreur est survenue lors de la récupération du chef de centre", translate(code));
      } else setHeadCenter(data);
    })();
  }, [center]);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="equipe">
        <Box>
          <div style={{ padding: "2rem" }}>Bientôt Disponible !</div>
        </Box>
      </CenterView>
    </div>
  );
}

const DetailCardTitle = styled.div`
  color: #7c7c7c;
`;
const DetailCardContent = styled.div`
  color: #000;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 1rem;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
  }
`;
