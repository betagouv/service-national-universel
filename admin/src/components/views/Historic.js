import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { formatStringLongDate } from "../../utils";
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
              <th>Opération</th>
              <th>Ancienne valeur</th>
              <th>Nouvelle valeur</th>
              <th>Date</th>
            </tr>
          </thead>
          {data.length === 0 ? <NoResult>Aucune données</NoResult> : null}
          <tbody>
            {data.map((hit) => (
              <Hit key={hit._id} hit={hit} />
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const Hit = ({ hit }) => {
  return (
    <>
      {hit.ops?.map((e, i) => {
        return (
          <tr key={i} style={{ borderBottom: i === hit.ops.length - 1 && "1px solid #ddd" }}>
            <td>{`${e.op} ${e.path}`}</td>
            <td>{JSON.stringify(e.originalValue) || "-"}</td>
            <td>{JSON.stringify(e.value) || "-"}</td>
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
    border-top: 1px solid #f4f5f7;
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
