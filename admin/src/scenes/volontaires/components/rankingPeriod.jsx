import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, PERIOD, translate } from "snu-lib";

export default function RankingPeriod({ period, handleChange, name, values, disabled }) {
  const [items, setItems] = useState(values[name] ? values[name] : []);

  const updateList = (value) => {
    handleChange({ ...values, [name]: value });
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
    if (period === PERIOD.DURING_HOLIDAYS && !Object.keys(MISSION_PERIOD_DURING_HOLIDAYS).includes(items[0])) defaultRanking = Object.keys(MISSION_PERIOD_DURING_HOLIDAYS);
    if (period === PERIOD.DURING_SCHOOL && !Object.keys(MISSION_PERIOD_DURING_SCHOOL).includes(items[0])) defaultRanking = Object.keys(MISSION_PERIOD_DURING_SCHOOL);
    updateList(defaultRanking);
  }, [period]);

  if (!items) return <div />;

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list" isDropDisabled={disabled}>
          {(provided) => (
            <div className="rounded-2xl border-[1px]  px-2 " ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((e, i) => (
                <Item key={e} index={i} value={e} values={values} updateList={updateList} name={name} disabled={disabled} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

Array.prototype.toggleValue = function (i, j) {
  const temp = this[j];
  this[j] = this[i];
  this[i] = temp;
};

const Item = ({ value, values, index, updateList, name, disabled }) => {
  const handleMove = (index, delta) => {
    const nextIndex = index + delta;
    if (nextIndex >= 0 && nextIndex < values[name].length) {
      const d = values[name];
      d.toggleValue(nextIndex, index);
      updateList(d);
    }
  };

  return (
    <Draggable draggableId={value} index={index}>
      {(provided) => (
        <div
          className={`flex flex-1 items-center justify-between py-2.5 ${index !== 0 ? "border-t-[1px] border-gray-200" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <div className="flex flex-1 items-center">
            <RoundItem value={index + 1} />
            <div className="my-0 mx-4">{translate(value)}</div>
          </div>
          {!disabled && (
            <div className="flex">
              <RoundItem plus onClick={() => handleMove(index, -1)} />
              <RoundItem minus onClick={() => handleMove(index, 1)} />
            </div>
          )}
        </div>
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
  return (
    <div className="my-0 mx-[0.1rem] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-[1px] border-[#d2d6dc] text-sm text-[#6b7280]" onClick={onClick}>
      {getValue()}
    </div>
  );
};
