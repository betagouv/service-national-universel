import React from "react";
import { useSelector } from "react-redux";

import StepProfilOnline from "./stepProfilOnline";
import StepProfilOffline from "./stepProfilOffline";

export default function StepProfil() {
  const young = useSelector((state) => state.Auth.young);

  if (young?.email) return <StepProfilOnline />;

  return <StepProfilOffline />;
}
