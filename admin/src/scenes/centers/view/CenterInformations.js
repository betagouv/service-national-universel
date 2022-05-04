import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiHandicap } from "react-icons/bi";

import { getDepartmentNumber, canCreateOrUpdateCohesionCenter } from "../../../utils";
import { Box } from "../../../components/box";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default function Details({ center }) {
  const user = useSelector((state) => state.Auth.user);
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "2rem 3rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <h4 style={{ marginBottom: "2rem" }}>{center.name}</h4>
        {canCreateOrUpdateCohesionCenter(user) ? (
          <div style={{ flexBasis: "0" }}>
            <Link to={`/centre/${center._id}/edit`}>
              <PanelActionButton title="Modifier" icon="pencil" style={{ margin: 0 }} />
            </Link>
          </div>
        ) : null}
      </div>
      <div className="flex w-2/5">
        <Box>
          <div className="p-9">
            <div className="flex justify-between ">
              <h4>
                <strong>Informations du centre</strong>
              </h4>
              {center.pmr === "true" ? (
                <div className="flex bg-[#14B8A6] rounded-full px-3 py-1 items-center text-[#F0FDFA] text-md gap-1">
                  <BiHandicap size={20} />
                  <div>Accessible&nbsp;PMR</div>
                </div>
              ) : null}
            </div>
            <div>
              <Donnee title={"Région"} value={center.region} number={""} />
              <Donnee title={"Département"} value={center.department} number={`(${getDepartmentNumber(center.department)})`} />
              <Donnee title={"Ville"} value={center.city} number={`(${center.zip})`} />
              <Donnee title={"Adresse"} value={center.address} number={""} />
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}

const Donnee = ({ title, value, number }) => {
  return (
    <div className="flex pt-4">
      <div className="w-1/2 text-brand-detail_title "> {title} : </div>
      <div className="w-1/2 font-medium">
        {value} {number}
      </div>
    </div>
  );
};
