import React from "react";
import { useSelector } from "react-redux";
import hero from "../../assets/hero/home.png";
import Engagement from "./components/Engagement";
import JDMA from "@/components/JDMA";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import StatusNotice from "./components/StatusNotice";
import { YOUNG_STATUS } from "snu-lib";

export default function RefusedV2() {
  const young = useSelector((state) => state.Auth.young);

  return (
    <HomeContainer>
      <HomeHeader title={`${young.firstName}, nous sommes désolés`} img={hero}>
        <br />
        <StatusNotice status={YOUNG_STATUS.REFUSED} />
        {young?.inscriptionRefusedMessage && <p className="mt-4 text-gray-500">En voici la raison principale&nbsp;: {young.inscriptionRefusedMessage}</p>}
      </HomeHeader>
      <br />
      <Engagement />
      <div className="mt-20 flex justify-end">
        <JDMA id={3154} />
      </div>
    </HomeContainer>
  );
}
