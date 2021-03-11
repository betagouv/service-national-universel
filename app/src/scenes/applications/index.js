import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { toastr } from "react-redux-toastr";

import Loader from "../../components/Loader";
import Application from "./components/application";
import api from "../../services/api";

export default () => {
  const [applications, setApplications] = useState(null);
  const young = useSelector((state) => state.Auth.young);

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
      const { ok, data, code } = await api.get(`/application/young/${young._id}`);
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
        <h1>Suivez vos candidatures aux missions d'intérêt général</h1>
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
            <p>Vous n'avez candidaté à aucune mission.</p>
            <Link to="/mission">
              <Button>Trouver des missions</Button>
            </Link>
          </NoResult>
        )}
      </Container>
    </div>
  );
};

const Heading = styled(Container)`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 2rem;
    font-weight: 700;
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
    text-transform: uppercase;
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
