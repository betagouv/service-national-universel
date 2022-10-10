import React, { useContext } from "react";
import Loader from "../../../components/Loader";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";

export default function Done() {
  const { young } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;
  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Done</h1>
        <div>Ferme la fenertre</div>
      </div>
    </>
  );
}
