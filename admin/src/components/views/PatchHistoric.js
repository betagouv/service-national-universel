import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { formatStringLongDate, translate, YOUNG_STATUS_COLORS, colors } from "../../utils";
import Loader from "../Loader";
import Badge from "../Badge";
import api from "../../services/api";

export default function PatchHistoric({ model, value, field, previewNumber = 1 }) {
  const [data, setData] = useState();
  const [isExpand, setIsExpand] = useState(false);

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/${model}/${value._id}/patches`);
      if (!ok) return;
      const correctionMessages = data.reduce((finalArray, historyObject) => {
        for (const item of historyObject.ops) {
          if (item.path === `/${field}`) {
            finalArray.push({
              _id: historyObject._id,
              createdAt: historyObject.date,
              userName: `${historyObject.user.firstName} ${historyObject.user.lastName}`,
              userId: historyObject.user._id,
              note: item.value,
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
  }, [model, value, field]);

  return !data ? (
    <Loader />
  ) : (
    <>
      <Historic className="historic">
        {isExpand
          ? data.map((historicItem, key) => <HistoricItem key={key} item={historicItem} />)
          : data?.slice(0, previewNumber)?.map((historicItem, key) => <HistoricItem key={key} item={historicItem} />)}
      </Historic>
      {data.length > previewNumber ? (
        isExpand ? (
          <ToggleButton style={{ marginLeft: "0.5rem", marginTop: "1rem" }} onClick={() => setIsExpand((e) => !e)}>
            CACHER L&apos;HISTORIQUE
          </ToggleButton>
        ) : (
          <ToggleButton style={{ marginLeft: "0.5rem", marginTop: "1rem" }} onClick={() => setIsExpand((e) => !e)}>
            AFFICHER L&apos;HISTORIQUE
          </ToggleButton>
        )
      ) : null}
    </>
  );
}

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
      {item.status ? <Badge text={translate(item.status)} color={YOUNG_STATUS_COLORS[item.status]} /> : null}
      <div className="history-detail">
        {item.note ? <Note value={item.note} /> : "-"}
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

  const renderText = () => {
    if (!rest) return preview;
    return preview + (expandNote ? rest : " ...");
  };

  return (
    <div>
      « {renderText()} »<ToggleButton onClick={() => setExpandNote((e) => !e)}>{rest ? (expandNote ? "  VOIR MOINS" : "  VOIR PLUS") : null}</ToggleButton>
    </div>
  );
};

const Item = styled.li`
  padding-left: 1rem;
`;

const ToggleButton = styled.div`
  font-style: normal;
  color: #696974;
  margin-bottom: 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  :hover {
    color: ${colors.purple};
  }
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
    :nth-last-child(n + 2) {
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
        /* z-index: -1; */
      }
    }
  }
  .historic {
    padding: 30px 25px;
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
`;
