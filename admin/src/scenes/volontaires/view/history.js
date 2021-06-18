import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import { formatStringLongDate, translate } from "../../../utils";
import WrapperHistory from "./wrapper";
import Loader from "../../../components/Loader";
import api from "../../../services/api";

export default ({ young }) => {
  const [data, setData] = useState();
  const user = useSelector((state) => state.Auth.user);

  if (user.role !== "admin") return <Redirect to="/" />;

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/young/${young._id}/patches`);
      if (!ok) return;
      setData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPatches();
  });

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperHistory young={young} tab="historique">
        {!data ? (
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
                <tbody>
                  {data.map((hit, i) => (
                    <Hit key={i} hit={hit} />
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </WrapperHistory>
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
