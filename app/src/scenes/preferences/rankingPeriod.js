import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { PERIOD_DURING_HOLIDAYS, PERIOD_DURING_SCHOOL, PERIOD, translate } from "../../utils";

export default ({ title, period, handleChange, name, values }) => {
  const [items, setItems] = useState(values[name]);

  const updateList = (value) => {
    handleChange({ target: { name, value } });
    setItems(value);
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const res = reorder(items, result.source.index, result.destination.index);
    updateList(res);
  };

  useEffect(() => {
    let defaultRanking = items;
    if (period === PERIOD.DURING_HOLIDAYS && !Object.keys(PERIOD_DURING_HOLIDAYS).includes(items[0])) defaultRanking = Object.keys(PERIOD_DURING_HOLIDAYS);
    if (period === PERIOD.DURING_SCHOOL && !Object.keys(PERIOD_DURING_SCHOOL).includes(items[0])) defaultRanking = Object.keys(PERIOD_DURING_SCHOOL);
    updateList(defaultRanking);
  }, [period]);

  if (!items) return <div />;

  return (
    <Container>
      <Title>{title}</Title>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((e, i) => (
                <Item key={e} index={i} value={e} values={values} updateList={updateList} name={name} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

Array.prototype.toogleValue = function (i, j) {
  const temp = this[j];
  this[j] = this[i];
  this[i] = temp;
};

const Item = ({ value, values, index, updateList, name }) => {
  const handleMove = (index, delta) => {
    const nextIndex = index + delta;
    if (nextIndex >= 0 && nextIndex < values[name].length) {
      const d = values[name];
      d.toogleValue(nextIndex, index);
      updateList(d);
    }
  };

  return (
    <Draggable draggableId={value} index={index}>
      {(provided) => (
        <ItemContainer ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <div style={{ display: "flex", flex: 1 }}>
            <RoundItem value={index + 1} />
            <Label>{translate(value)}</Label>
          </div>
          <div style={{ display: "flex" }}>
            <RoundItem plus onClick={() => handleMove(index, -1)} />
            <RoundItem minus onClick={() => handleMove(index, 1)} />
          </div>
        </ItemContainer>
      )}
    </Draggable>
  );
};

const RoundItem = ({ value, plus, minus, onClick }) => {
  const getValue = () => {
    if (plus) return "↑";
    if (minus) return "↓";
    return value;
  };
  return <Badge onClick={onClick}>{getValue()}</Badge>;
};

const Label = styled.div`
  margin: 0 1rem;
`;

const Badge = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.75rem;
  height: 1.75rem;
  color: #6b7280;
  font-size: 0.75rem;
  border-width: 1px;
  border-color: #d2d6dc;
  border-style: solid;
  border-radius: 9999px;
  cursor: pointer;
  margin: 0 0.1rem;
`;

const Container = styled.div`
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border-width: 1px;
  border-radius: 0.5rem;
  border-style: solid;
  border-color: #d2d6dc;
  margin: 0 0.25rem 1rem 0.25rem;
  display: flex;
  flex-direction: column;
  width: fit-content;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  font-size: 0.875rem;
  letter-spacing: 0.05rem;
  color: #161e2e;
  text-transform: uppercase;
  font-weight: 700;
`;

const ItemContainer = styled.div`
  border-top-width: 1px;
  border-top-color: #d2d6dc;
  border-top-style: solid;
  width: 100%;
  flex: 1;
  padding: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
