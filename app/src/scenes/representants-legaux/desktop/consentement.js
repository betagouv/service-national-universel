import React, {useContext} from "react";
import {useHistory} from "react-router-dom";
import {RepresentantsLegauxContext} from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";

export default function Presentation({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  // function onSubmit() {
  //   history.push(`/representants-legaux/verification?token=${token}`);
  // }

  return (
    <>
      <Navbar step={step} />
    </>
  );
}

