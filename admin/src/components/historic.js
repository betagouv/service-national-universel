import React, { useState } from "react";
import styled from "styled-components";
import { translate, YOUNG_STATUS, formatStringLongDate, YOUNG_STATUS_COLORS } from "../utils";
import Badge from "../components/Badge";

export default ({ value }) => {
  if (!value) return <div />;

  return (
    <Historic className="info">
      {value.map((historicItem, key) => (
        <HistoricItem key={key} item={historicItem} />
      ))}
    </Historic>
  );
};

const HistoricItem = ({ item }) => {
  const getLabel = () =>
    item.userName ? (
      <>
        Par <b>{item.userName}</b>
      </>
    ) : (
      <b>Validation Automatique</b>
    );

  return (
    <Item>
      <Badge text={translate(item.status)} color={YOUNG_STATUS_COLORS[item.status]} />
      <div className="history-detail">
        {item.note ? <Note value={item.note} /> : null}
        <div>
          {getLabel()} • le {formatStringLongDate(item.createdAt)}
        </div>
      </div>
    </Item>
  );
};

const Note = ({ value }) => {
  const [expandNote, setExpandNote] = useState(false);
  const preview = value.substring(0, 100);
  const rest = value.substring(100);

  const toggleNote = () => {
    setExpandNote(!expandNote);
  };

  const renderText = () => {
    if (!rest) return preview;
    return preview + (expandNote ? rest : " ...");
  };

  return (
    <div>
      « {renderText()} »
      <div className="see-more" onClick={toggleNote}>
        {rest ? (expandNote ? "  VOIR MOINS" : "  VOIR PLUS") : null}
      </div>
    </div>
  );
};

const Item = styled.li`
  padding-left: 1rem;
`;

const Historic = styled.ul`
  list-style-type: none;
  > li {
    ::before {
      content: "";
      display: block;
      border: 2px solid #dfdfdf;
      background-color: white;
      height: 0.7rem;
      width: 0.7rem;
      border-radius: 50%;
      position: relative;
      left: calc(-1rem - 5px);
      top: 32px;
      z-index: 1;
    }
    :not(:last-child) {
      position: relative;
      ::after {
        content: "";
        display: block;
        height: 100%;
        width: 1px;
        background-color: #dfdfdf;
        position: absolute;
        left: 0;
        top: 32px;
        z-index: -1;
      }
    }
  }
  .info {
    padding: 30px 25px;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      margin-bottom: 15px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${require("../assets/pencil.svg")}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .history-detail {
    color: #a3a3a3;
    font-size: 0.8rem;
    margin-top: 0.8rem;
    margin-left: 10px;
  }
  .see-more {
    font-style: normal;
    color: #696974;
    margin-bottom: 0.8rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    :hover {
      color: #5145cd;
    }
  }
`;
