import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";

import Avatar from "../../components/Avatar";

import api from "../../services/api";
import { apiURL } from "../../config";

const FILTERS = [];

export default () => {
  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="referent" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <Header>
          <div>
            <Subtitle>TEST SEB</Subtitle>
            <Title>Gérer votre équipe</Title>
          </div>
          <Link to="/team/invite">
            <Button>Inviter un membre</Button>
          </Link>
        </Header>
        <div style={{ padding: "25px 40px" }}>
          <MemberTitle>Membres</MemberTitle>
          <ReactiveList
            componentId="result"
            react={{ and: FILTERS }}
            pagination={false}
            size={25}
            showLoader={true}
            // dataField="createdAt"
            // sortBy="desc"
            loader="Chargement..."
            innerClass={{ pagination: "pagination" }}
            dataField="created_at"
            onNoResults={() => <div />}
            renderResultStats={({ numberOfResults, time }) => <div />}
            render={({ data }) => data.map((hit) => <Hit referent={hit} />)}
          />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ referent }) => {
  const fullname =`${referent.firstName} ${referent.lastName}`
  return (
    <TeamMember>
      <Avatar name={fullname} />
      <div>
        <h2>{fullname}</h2>
        <p>{referent.role}</p>
      </div>
    </TeamMember>
  );
};

const Header = styled.div`
  padding: 40px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;

const Button = styled.div`
  background-color: #3182ce;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
`;

const MemberTitle = styled.div`
  color: rgb(106, 111, 133);
  margin-bottom: 20px;
`;

const TeamMember = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 20px;
  img {
    width: 40px;
    height: 40px;
    background-color: #aaa;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 15px;
  }
  h2 {
    color: #000;
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    text-transform: uppercase;
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;
