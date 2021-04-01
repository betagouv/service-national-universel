import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import { translate } from "../../../utils";

export default ({ program, image, enableToggle = true, onDelete }) => {
  const [expandDetails, setExpandDetails] = useState(false);
  const preview = program.description.substring(0, 130);

  const toggleDetails = () => {
    setExpandDetails(!expandDetails);
  };

  const renderText = () => {
    if (!enableToggle) return program.description;

    return (
      <>
        {expandDetails ? (
          <>
            <Detail title="Qu'est ce que c'est ?" value={program.description} />
            <Detail title="C'est pour ?" value={program.descriptionFor} />
            <Detail title="Est-ce indemnisé ?" value={program.descriptionMoney} />
            <Detail title="Quelle durée d'engagement ?" value={program.descriptionDuration} />
            <ToogleText onClick={toggleDetails}>réduire</ToogleText>
          </>
        ) : (
          <>
            {preview} ...<ToogleText onClick={toggleDetails}>lire plus</ToogleText>
          </>
        )}
      </>
    );
  };

  const renderVisibility = () => {
    if (program.visibility === "NATIONAL") return `Visibilité Nationale`;
    if (program.visibility === "DEPARTMENT") return `Visibilité Département : ${program.department}`;
    if (program.visibility === "REGION") return `Visibilité Région : ${program.region}`;
  };

  const Detail = ({ title, value }) => {
    if (!value) return <span />;
    return (
      <div style={{ marginBottom: "0.3rem" }}>
        <b>{title}</b> <p>{value}</p>
      </div>
    );
  };

  return (
    <Card>
      <a href={program.href} className="thumb">
        <img src={image} />
        <Badge>{program.type}</Badge>
      </a>
      <Description>
        <div>{renderVisibility()}</div>
        <h4>{program.name}</h4>
        <div>{renderText()}</div>
      </Description>
      <Actions program={program} onDelete={onDelete} />
    </Card>
  );
};

const Actions = ({ program, onDelete }) => {
  const user = useSelector((state) => state.Auth.user);
  const id = program._id;

  const handleUserAccess = () =>
    (program.visibility === "NATIONAL" && user.role === "admin") ||
    (program.visibility === "REGION" && ["admin", "referent_region"].includes(user.role)) ||
    (program.visibility === "DEPARTMENT" && ["admin", "referent_region", "referent_department"].includes(user.role));

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer cette possibilité d'engagement ?")) return;
    try {
      const { ok, code } = await api.remove(`/program/${id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette possibilité d'engagement a été supprimée.");
      return onDelete();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la mission :", translate(e.code));
    }
  };

  return (
    handleUserAccess() && (
      <ActionStyle>
        <Link to={`/contenu/${id}/edit`}>
          <Action>
            <div>Editer</div>
          </Action>
        </Link>
        {user.role === "admin" ? (
          <Action onClick={handleDelete}>
            <div>Supprimer</div>
          </Action>
        ) : null}
      </ActionStyle>
    )
  );
};

const ActionStyle = styled.div`
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #ddd;
  > * {
    flex: 1;
    :not(:last-child) {
      border-right: 1px solid #ddd;
    }
  }
`;

const Action = styled.div`
  color: #333;
  :hover {
    color: #000 !important;
    background-color: #f8f8f8;
  }
  text-align: center;
  padding: 1rem 0;
  cursor: pointer;
`;

const Description = styled.div`
  flex: 1;
  padding: 1rem;
  color: #6b7280;
  font-weight: 400;
  h4 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 1rem;
  overflow: hidden;
  height: 100%;
  .thumb {
    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  }
`;

const SeeMore = styled.a`
  :hover {
    color: #372f78;
  }
  cursor: pointer;
  color: #5145cd;
  font-size: 16px;
  font-weight: 600;
`;

const ToogleText = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  cursor: pointer;
`;

const Badge = styled.div`
  font-size: 0.8rem;
  color: #222;
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0.5rem 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;
