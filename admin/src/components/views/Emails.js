/* eslint-disable no-useless-escape */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { formatLongDateUTC, colors, canViewEmailHistory, ROLES } from "../../utils";
import api from "../../services/api";
import { Box } from "../../components/box";
import Loader from "../../components/Loader";
import { capture } from "../../sentry";

export default function Emails({ email }) {
  const [emails, setEmails] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [minify, setMinify] = useState(true);
  const SIZE = 10;

  const handleMinify = () => {
    setMinify(!minify);
  };

  if (!canViewEmailHistory(user)) return null;

  const getEmails = async () => {
    if (!email) return;
    const { ok, data, code } = await api.get(`/email?email=${encodeURIComponent(email)}`);
    if (!ok) {
      setEmails([]);
      capture(code);
      return toastr.error("Oups, une erreur est survenue", code);
    }
    if (user.role === ROLES.ADMIN) return setEmails(data);
    else {
      const emails = data.filter((e) => e.event === "delivered");
      return setEmails(emails);
    }
  };

  useEffect(() => {
    getEmails();
  }, []);

  return !emails ? (
    <Loader />
  ) : (
    <Box>
      <div style={{ fontSize: ".9rem", padding: "1rem", color: colors.darkPurple }}>Emails envoyés par la plateforme</div>
      {emails?.length ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>id</th>
                <th>Template id</th>
                <th style={{ width: "40%" }}>Objet</th>
                <th>Evenement</th>
                <th>Date</th>
                <th>Message id</th>
              </tr>
            </thead>
            <tbody>
              <>
                {emails?.slice(0, minify ? SIZE : emails.length).map((hit, i) => (
                  <Hit key={i} hit={hit} />
                ))}
              </>
            </tbody>
          </Table>
          {emails.length > SIZE ? <LoadMore onClick={handleMinify}>{minify ? "Voir plus" : "Réduire"}</LoadMore> : null}
        </>
      ) : (
        <NoResult>
          <b>{email}</b> n&apos;a reçu aucun mail.
        </NoResult>
      )}
    </Box>
  );
}

const Hit = ({ hit }) => {
  const translate = (t) => {
    switch (t) {
      case "opened":
        return "ouvert";
      case "request":
        return "demande";
      case "requests":
        return "demandes";
      case "delivered":
        return "délivré";
      case "deferred":
        return "différé";
      case "clicked":
        return "cliqué";
      case "clicks":
        return "cliques";
      case "unique_opened":
        return "ouveture unique";
      case "invalid_email":
        return "email invalide";
      case "sent":
        return "envoyé";
      case "soft_bounce":
        return "rebond (faible)";
      case "hard_bounce":
        return "rebond (fort)";
      case "unsubscribe":
        return "désinscrit";
      case "complaint":
        return "plainte";
      case "blocked":
        return "bloqué";
      case "error":
        return "erreur";
      default:
        return t;
    }
  };
  return (
    <tr>
      <td style={{ fontSize: "0.8rem" }}>{hit._id}</td>
      <td>{hit.templateId || "-"}</td>
      <td>{hit.subject}</td>
      <td>{translate(hit.event)}</td>
      <td>{formatLongDateUTC(hit.date)}</td>
      <td>{hit.messageId.match(/[\d\.]+/g)[0]}</td>
    </tr>
  );
};

const LoadMore = styled.div`
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
  color: ${colors.darkPurple};
  cursor: pointer;
  :hover {
    font-weight: 500;
  }
`;

const NoResult = styled.div`
  font-style: italic;
  padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  * {
    cursor: default;
  }
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
  tbody tr {
    border-bottom: 1px solid #f4f5f7;
    :hover {
      background-color: #f4f5f7;
    }
  }
`;
