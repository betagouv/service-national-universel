import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, PERIOD, translate } from "snu-lib";

export default function RankingPeriod({ period, handleChange, name, values }) {
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
    if (period === PERIOD.DURING_HOLIDAYS && !Object.keys(MISSION_PERIOD_DURING_HOLIDAYS).includes(items[0])) defaultRanking = Object.keys(MISSION_PERIOD_DURING_HOLIDAYS);
    if (period === PERIOD.DURING_SCHOOL && !Object.keys(MISSION_PERIOD_DURING_SCHOOL).includes(items[0])) defaultRanking = Object.keys(MISSION_PERIOD_DURING_SCHOOL);
    updateList(defaultRanking);
  }, [period]);

  if (!items) return <div />;

  return (
    <Container>
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
}

const Item = ({ value, values, index, updateList, name }) => {
  const handleMove = (index, delta) => {
    const nextIndex = index + delta;
    if (nextIndex >= 0 && nextIndex < values[name].length) {
      const d = values[name];
      const temp = d[index];
      d[index] = d[nextIndex];
      d[nextIndex] = temp;
      updateList(d);
    }
  };

  return (
    <Draggable draggableId={value} index={index}>
      {(provided) => (
        <ItemContainer ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} index={index}>
          <div className="flex items-center ml-2 mr-4">
            <Badge>{index + 1}</Badge>
            <div className="mx-2">{translate(value)}</div>
          </div>
          <div className="flex mr-2">
            <RoundItem plus onClick={() => handleMove(index, -1)} className="mr-2" />
            <RoundItem minus onClick={() => handleMove(index, 1)} />
          </div>
        </ItemContainer>
      )}
    </Draggable>
  );
};

const RoundItem = ({ value, plus, minus, onClick, className = "" }) => {
  const getValue = () => {
    if (plus) return "↑";
    if (minus) return "↓";
    return value;
  };
  return (
    <Badge onClick={onClick} className={className}>
      {getValue()}
    </Badge>
  );
};

function Badge({ onClick = () => {}, className = "", children }) {
  return (
    <div
      className={`flex justify-center items-center rounded-full w-[1.75rem] h-[1.75rem] text-[#6b7280] text-[0.75rem] border-[#d2d6dc] border-[1px] cursor-pointer mx-[0.01rem] ${className}`}
      onClick={onClick}>
      {children}
    </div>
  );
}

function Container({ className = "", children }) {
  return <div className={`shadow border-[1px] border-[#d2d6dc] rounded-[0.5rem] flex flex-col w-[100%] md:w-fit ${className}`}>{children}</div>;
}

// eslint-disable-next-line react/display-name
const ItemContainer = React.forwardRef((props, ref) => (
  <div
    ref={ref}
    className={`${props.index === 0 ? "border-t-[0px]" : "border-t-[1px]"} border-t-[#d2d6dc] w-[100%] grow py-4 flex items-center justify-between ${props.className}`}
    {...props}>
    {props.children}
  </div>
));
