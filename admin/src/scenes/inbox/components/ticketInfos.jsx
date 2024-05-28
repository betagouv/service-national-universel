import Img from "../../../assets/copy.svg";
import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";

import PanelActionButton from "../../../components/buttons/PanelActionButton";
import api from "../../../services/api";
import { copyToClipboard, translate, getAge, formatDateFRTimezoneUTC, translatePhase1, translatePhase2 } from "../../../utils";
import { appURL } from "../../../config";
import copy from "../../../assets/copy.svg";
import plausibleEvent from "../../../services/plausible";

export default function TicketInfos({ ticket }) {
  const [user, setUser] = useState([]);
  const [tag, setTag] = useState("");
  const history = useHistory();
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();

  useEffect(() => {
    (async () => {
      const email = ticket?.contactEmail;
      if (ticket) {
        if (ticket?.contactGroup === "young") {
          const { data } = await api.get(`/young?email=${email}`);
          setUser(data);
          setTag("EMETTEUR_Volontaire");
        } else {
          const response = await api.get(`/referent?email=${email}`);
          setUser(response.data);
        }
      }
    })();
  }, [ticket]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${user.department}`);
      if (ok) return setReferentManagerPhase2(data);
      setReferentManagerPhase2(null);
    })();
    return () => setReferentManagerPhase2();
  }, [user]);

  const resolveTicket = async () => {
    const response = await api.put(`/SNUpport/ticket/${ticket._id}`, { status: "CLOSED" });
    if (!response.ok) console.log(response.status, "error");
    if (response.ok) toastr.success("Ticket résolu !");
    history.go(0);
  };

  const onPrendreLaPlace = async (young_id) => {
    if (!user) return toastr.error("Vous devez être connecté pour effectuer cette action.");

    plausibleEvent("Volontaires/CTA - Prendre sa place");
    const { ok } = await api.post(`/referent/signin_as/young/${young_id}`);
    if (!ok) return toastr.error("Une erreur s'est produite lors de la prise de place du volontaire.");
  };

  const renderInfos = () => {
    if (tag === "EMETTEUR_Volontaire") {
      return (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link to={`/volontaire/${user._id}`} target="_blank" rel="noopener noreferrer">
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            <Link to={`/volontaire/${user._id}/edit`} target="_blank" rel="noopener noreferrer">
              <PanelActionButton icon="pencil" title="Modifier" />
            </Link>
            <button
              onClick={() => {
                window.open(appURL, "_blank");
                onPrendreLaPlace(user._id);
              }}>
              <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
            </button>
          </div>
          <>
            {user.birthdateAt && <Item title="Date de naissance" content={`Né(e) le ${formatDateFRTimezoneUTC(user.birthdateAt)} • ${getAge(user.birthdateAt)} ans`} />}
            <Item title="Cohorte" content={user.cohort} />
            <Item title="E-mail" content={user.email} copy />
            <Item title="Département" content={user.department} />
            <Item title="Région" content={user.region} />
            <hr />
            <Item title="Statut phase 1" content={translatePhase1(user.statusPhase1)} />
            <Item title="Centre de cohésion" content={user.cohesionCenterName} />
            <hr />
            <Item title="Statut phase 2" content={translatePhase2(user.statusPhase2)} />
            <Item title="Contact phase 2" content={referentManagerPhase2?.email || (referentManagerPhase2 !== undefined && "Non trouvé") || "Chargement..."} copy />
            <Link to={`/volontaire/${user._id}/phase2`} target="_blank" rel="noopener noreferrer">
              <PanelActionButton icon="eye" title="Consulter les candidatures" />
            </Link>
            <hr />
            <Item title="Statut phase 3" content={user.statusPhase3} />
          </>
        </>
      );
    } else {
      return (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Link to={`/user/${user._id}`} target="_blank" rel="noopener noreferrer">
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            <Link to={`/user/${user._id}/edit`} target="_blank" rel="noopener noreferrer">
              <PanelActionButton icon="pencil" title="Modifier" />
            </Link>
            <button onClick={() => onPrendreLaPlace(user._id)}>
              <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
            </button>
          </div>
          <hr />
          <>
            <Item title="E-mail" content={user.email} copy />
            <Item title="Fonction" content={user.role} copy />
            <Item title="Département" content={user.department} />
            <Item title="Région" content={user.region} />
            <hr />
          </>
        </>
      );
    }
  };

  if (!user)
    return (
      <HeroContainer>
        <h4>Informations volontaire</h4>
        <div>
          <p>Veuiller sélectionner un ticket</p>
        </div>
      </HeroContainer>
    );

  return (
    <HeroContainer>
      {ticket === null ? (
        <div />
      ) : (
        <>
          {ticket?.status !== "CLOSED" ? (
            <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
              <button className="button" onClick={resolveTicket}>
                Archiver la demande
              </button>
            </div>
          ) : null}
          <div className="name">
            {user.firstName} {user.lastName}
          </div>
          {renderInfos()}
        </>
      )}
    </HeroContainer>
  );
}

const Item = ({ title, content, copy = false }) => {
  if (!content) return null;
  return (
    <div>
      <p className="subtitle">{title}&nbsp;:</p>
      <p className="info">
        {translate(content)}
        {copy ? (
          <div
            className="icon"
            icon={copy}
            onClick={() => {
              copyToClipboard(content);
              toastr.success(`'${title}' a été copié dans le presse papier.`);
            }}
          />
        ) : null}
      </p>
    </div>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  border-top: 1px solid #e4e4e7;
  border-bottom: 1px solid #e4e4e7;
  background-color: #fff;
  max-width: 300px;
  min-width: 300px;
  overflow-y: scroll;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }

  .title {
    font-style: normal;
    font-weight: bold;
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .subtitle {
    font-size: 0.75rem;
    line-height: 1rem;
    color: #979797;
    margin: 0px;
  }

  .info {
    display: flex;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 1rem;
    .icon {
      cursor: pointer;
      margin: 0 0.5rem;
      width: 15px;
      height: 15px;
      background: ${`url(${Img})`};
      background-repeat: no-repeat;
      background-position: center;
      background-size: 15px 15px;
    }
  }

  .name {
    font-size: 1rem;
    font-weight: bold;
  }

  .button {
    margin-bottom: 1rem;
    padding: 10px;
    border-width: 0px;
    background: #6bc762;
    border-radius: 10px;
    width: 100%;
    color: white;
  }
`;
