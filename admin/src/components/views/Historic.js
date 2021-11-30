import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { formatStringLongDate, translateOperationName, translateModelFields, translate } from "../../utils";
import Loader from "../../components/Loader";
import api from "../../services/api";

export default ({ model, value }) => {
  const [data, setData] = useState();

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/${model}/${value._id}/patches`);
      if (!ok) return;
      setData(data);
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
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <Table>
          <thead>
            <tr>
              <th>Acteur</th>
              <th>Opération</th>
              <th>Ancienne valeur</th>
              <th>Nouvelle valeur</th>
              <th>Date</th>
            </tr>
          </thead>
          {data.length === 0 ? <NoResult>Aucune données</NoResult> : null}
          <tbody>
            {data.map((hit) => (
              <Hit model={model} key={hit._id} hit={hit} />
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const Hit = ({ hit, model }) => {
  function isIsoDate(str) {
    if (!Date.parse(str)) return false;
    var d = new Date(str);
    return d.toISOString() === str;
  }
  return (
    <>
      {hit.ops?.map((e, i) => {
        const originalValue = translate(JSON.stringify(e.originalValue)?.replace(/"/g, ""));
        const value = translate(JSON.stringify(e.value)?.replace(/"/g, ""));

        return (
          <tr key={i} style={{ borderBottom: i === hit.ops.length - 1 && "1px solid #ddd" }}>
            <td>{hit.user && hit.user.firstName && hit.user.lastName ? `${hit.user.firstName} ${hit.user.lastName}` : "Non renseigné"}</td>
            <td>
              <Op>{`${translateOperationName(e.op)}`}</Op> : {`${translateModelFields(model, e.path.substring(1))}`}
            </td>
            <td>{(isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue) || "-"}</td>
            <td>{(isIsoDate(value) ? formatStringLongDate(value) : value) || "-"}</td>
            <td>{formatStringLongDate(hit.date)}</td>
          </tr>
        );
      })}
    </>
  );
};

const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  background-color: #fff;
  th {
    border-bottom: 1px solid #f4f5f7;
    padding: 15px;
    font-weight: 400;
    font-size: 14px;
    text-transform: uppercase;
  }
  td {
    padding: 15px;
    font-size: 14px;
    font-weight: 300;
    strong {
      font-weight: 700;
      margin-bottom: 5px;
      display: block;
    }
  }
  td:first-child,
  th:first-child {
    padding-left: 25px;
  }

  //each line (header included)
  tr {
    display: flex;
    //each column
    > * {
      flex: 1;
    }
  }
  tbody tr {
    :hover {
      background-color: #e6ebfa;
    }
  }
`;

const NoResult = styled.div`
  font-style: italic;
  padding: 1rem;
`;

const Op = styled.span`
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.7rem;
`;
