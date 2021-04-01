import React from "react";
import styled from "styled-components";

import { translate } from "../../../utils";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

export default ({ young }) => {
  const history = useHistory();

  return (
    <DeleteBtn
      onClick={async () => {
        if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce profil")) return;
        try {
          const { ok, code } = await api.remove(`/young/${young._id}`);
          if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
          if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
          toastr.success("Ce profil a été supprimé.");
          return history.push(`/inscription`);
        } catch (e) {
          console.log(e);
          return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
        }
      }}
    >
      Supprimer
    </DeleteBtn>
  );
};

const DeleteBtn = styled.button`
  background-color: #bd2130;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #dc3545;
  }
`;
