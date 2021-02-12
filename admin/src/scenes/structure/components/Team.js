import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../../../components/Avatar";

export default function Team({ referents }) {
  if (!referents.length) return null;
  return (
    <Info title={`Équipe (${referents.length})`}>
      {referents.map((referent, k) => (
        <Link key={k} to={`/user/${referent._id}`}>
          <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }} key={k}>
            <Avatar name={`${referent.firstName} ${referent.lastName}`} />
            <div>{`${referent.firstName} ${referent.lastName}`}</div>
          </div>
        </Link>
      ))}
    </Info>
  );
}

const Info = ({ children, title }) => {
  return (
    <div className="info">
      <div style={{ position: "relative" }}>
        <div className="info-title">{title}</div>
      </div>
      {children}
    </div>
  );
};
