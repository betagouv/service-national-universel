import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BiHandicap } from "react-icons/bi";

import { translate, getDepartmentNumber, canCreateOrUpdateCohesionCenter, translateSessionStatus } from "../../../utils";
import { Box } from "../../../components/box";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default function Details({ center, sessions }) {
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
              {center.pmr === "true" ?
                <div className="flex bg-[#14B8A6] rounded-full px-2 py-1 items-center text-[#F0FDFA] text-md">
                  <BiHandicap size={20} />
                  <div>  Accessible PMR </div>
                </div>
                : null}
            </div>
            <div >
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
      <div className="w-1/2 font-medium"> {value} {number} </div>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: center;
    font-size: 1rem;
    text-align: left;
    margin-top: 1rem;
    &-title-first {
      width: 130px;
      margin-right: 1rem;
      font-weight: bold;
    }
    &-title-second {
      width: 220px;
      margin-right: 1rem;
      font-weight: bold;
    }
    &-text {
      margin-left: 1rem;
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
    &-badge {
      background-color: #ede9fe;
      color: #5b21b6;
      border-radius: 4px;
      padding: 0.2rem 1rem;
    }
  }
`;

const Container = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
`;
