import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { toastr } from "react-redux-toastr";

import Loader from "../../components/Loader";
import Application from "./components/application";
import api from "../../services/api";
import AlertBox from "../../components/AlertBox";
import { permissionPhase2 } from "../../utils";

export default function Index() {
  const [applications, setApplications] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  if (!young || !permissionPhase2(young)) history.push("/");

  const toggleShowInfo = () => {
    setShowInfo(!showInfo);
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const res = reorder(applications, result.source.index, result.destination.index);
    setApplications(res);
    updatePriority(res);
  };

  const updatePriority = async (value) => {
    console.log(value);
    for (let i = 0; i < value.length; i++) {
      await api.put("/application", { ...value[i], priority: i + 1 });
    }
  };

  useEffect(() => {
    (async () => {
      if (!young) return;
      const { ok, data, code } = await api.get(`/young/${young._id}/application`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
      console.log(data);
      return setApplications(data);
    })();
  }, []);

  if (!applications) return <Loader />;

  return (
    <div>
      <Heading>
        <p>Phase 2</p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Suivez vos candidatures aux missions d&apos;intérêt général</h1>
          <div className="icon" onClick={toggleShowInfo}>
            <svg fill="none" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        {showInfo ? (
          <AlertBox
            onClose={() => setShowInfo(false)}
            title="Classer mes candidatures"
            message="L'ordre de vos choix de missions sera pris en compte pour l'attribution de votre MIG. Pour modifier l'ordre, passez votre souris au niveau du titre et lorsqu'une main s'affiche cliquez et déplacez le bloc."
          />
        ) : null}
      </Heading>
      <Container>
        {applications.length ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {applications.map((e, i) => (
                    <Application key={e._id} index={i} application={e} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <NoResult>
            <p>Vous n&apos;avez candidaté à aucune mission.</p>
            <Link to="/mission">
              <Button>Trouver des missions</Button>
            </Link>
          </NoResult>
        )}
      </Container>
    </div>
  );
}

const Heading = styled(Container)`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 2rem;
    font-weight: 700;
    flex: 1;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  .icon {
    height: 24px;
    width: 24px;
    margin-right: 20px;
    svg {
      stroke: #42389d;
    }
    cursor: pointer;
  }
`;

const NoResult = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  p {
    color: #3d4151;
    font-size: 0.8rem;
    font-style: italic;
  }
`;

const Button = styled.div`
  width: fit-content;
  cursor: pointer;
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 1rem;
  padding: 0.8rem 3rem;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
  }
`;
