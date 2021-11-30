import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { formatStringLongDate, translate, YOUNG_STATUS_COLORS, colors } from "../../utils";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import api from "../../services/api";

export default ({ model, value }) => {
  const [data, setData] = useState();
  const [isExpand, setIsExpand] = useState(false);
  const toggleList = () => {
    setIsExpand(!isExpand);
  };

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/${model}/${value._id}/patches`);
      if (!ok) return;
      const correctionMessages = data.reduce((finalArray, historyObject) => {
        for (const item of historyObject.ops) {
          if (item.path === "/inscriptionCorrectionMessage") {
            finalArray.push({
              _id: historyObject._id,
              createdAt: historyObject.date,
              userName: `${historyObject.user.firstName} ${historyObject.user.lastName}`,
              userId: historyObject.user._id,
              note: item.value,
              status: "WAITING_CORRECTION",
            });
          }
        }
        return finalArray.sort((a, b) => a.createdAt - b.createdAt);
      }, []);

      setData(correctionMessages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPatches();
  }, []);

  return !data ? (
    <Loader />
  ) : (
    <Historic className="info">
      {isExpand ? (
        <>
          {data.map((historicItem, key) => (
            <HistoricItem key={key} item={historicItem} />
          ))}
          {data.length === 1 ? null : (
            <div className="see-more" style={{ marginLeft: "0.5rem", marginTop: "1rem" }} onClick={toggleList}>
              CACHER L'HISTORIQUE
            </div>
          )}
        </>
      ) : (
        <>
          <HistoricItem key={data[data.length - 1]._id} item={data[data.length - 1]} />
          <div className="see-more" style={{ marginLeft: "0.5rem", marginTop: "1rem" }} onClick={toggleList}>
            AFFICHER L'HISTORIQUE
          </div>
        </>
      )}
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
  /* display: flex;
  flex-direction: column-reverse;
  max-height: 400px;
  overflow: auto; */
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
      background: url(${require("../../assets/pencil.svg")}) center no-repeat;
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
      color: ${colors.purple};
    }
  }
`;
