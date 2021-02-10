import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Application from "./components/application";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";

export default () => {
  const [applications, setApplications] = useState([]);
  const young = useSelector((state) => state.Auth.young);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  function onDragEnd(result) {
    if (!result.destination || result.destination.index === result.source.index) return;

    const res = reorder(applications, result.source.index, result.destination.index);
    setApplications(res);
  }

  useEffect(() => {
    (async () => {
      if (!young) return;
      const { ok, data, code } = await api.get(`/application/young/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      data.sort((a, b) => (a.priority > b.priority ? 1 : b.priority > a.priority ? -1 : 0));
      return setApplications(data);
    })();
  }, []);

  return (
    <div>
      <Heading>
        <p>Phase 2</p>
        <h1>Suivez vos candidatures aux missions d'intérêt général</h1>
      </Heading>
      <Container>
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

const Modifybutton = styled(Link)`
  border: 1px solid #d2d6dc;
  padding: 10px 15px 10px 30px;
  color: #3d4151;
  font-size: 12px;
  border-radius: 4px;
  background: url(${require("../../assets/pen.svg")}) left 5px center no-repeat;
  background-size: 18px;
  height: fit-content;
  /* position: absolute;
  right: 40px;
  top: 20px; */
  :hover {
    color: #333;
  }
`;
