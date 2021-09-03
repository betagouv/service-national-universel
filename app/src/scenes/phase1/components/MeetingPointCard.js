import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { translate } from "../../../utils";

export default ({ meetingPoint, meetingPointId, onClick, selected, ...props }) => {
  const young = useSelector((state) => state.Auth.young);

  const [data, setData] = useState(meetingPoint);
  const [center, setCenter] = useState();

  const getData = async () => {
    const { data, code, ok } = await api.get(`/meeting-point/${meetingPointId}`);
    if (!ok) return toastr.error("error", translate(code));
    setData(data);
  };
  const getCenter = async () => {
    const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
    if (!ok) return toastr.error("error", translate(code));
    setCenter(data);
  };

  useEffect(() => {
    getCenter();
    if (!meetingPoint && meetingPointId) getData(meetingPointId);
  }, [young]);

  if ((!data && meetingPointId) || !center) return <Loader />;

  return (
    <HeroStyle {...props} onClick={onClick}>
      <Radio>
        <input type="radio" checked={selected} onChange={() => {}} /> {/* onVhange empty to prevent warning ==>> degedgbeurk */}
      </Radio>
      <Title>Je choisis le point de rassemblement</Title>
      <Address> {data?.departureAddress} </Address>
      <Separator />
      <Time>aller : {data?.departureAtString}</Time>
      <Time>retour : {data?.returnAtString}</Time>
    </HeroStyle>
  );
};

const Time = styled.div`
  text-transform: uppercase;
  color: #2e2e2e;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 500;
`;
const Title = styled.div`
  color: #2e2e2e;
  text-align: center;
  font-weight: 500;
`;

const HeroStyle = styled.div`
  cursor: pointer;
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  margin: 1rem auto;
  max-width: 30rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
`;

const Address = styled.div`
  text-align: center;
  color: #888;
  margin: 0.5rem;
`;

const Separator = styled.hr`
  margin: 1rem 0;
  height: 1px;
  width: 3rem;
  border-style: none;
  background-color: #e5e7eb;
`;

const Radio = styled.div`
  display: flex;
  align-items: center;
  color: #374151;
  margin-bottom: 15px;
  input {
    cursor: pointer;
    width: 23px;
    height: 23px;
  }
`;
