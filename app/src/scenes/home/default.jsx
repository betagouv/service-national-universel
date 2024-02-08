import React from "react";
import { useSelector } from "react-redux";
import { PHASE_STATUS_COLOR, translatePhase1, translatePhase2 } from "../../utils";
import Badge from "../../components/Badge";
import Img2 from "../../assets/homePhase2Desktop.png";
import Img3 from "../../assets/homePhase2Mobile.png";
import { Link } from "react-router-dom";

export default function HomeDefault() {
  const young = useSelector((state) => state.Auth.young);
  return (
    <main className="bg-white md:rounded-xl shadow-sm md:m-8 flex flex-col md:flex-row max-w-7xl pb-20 md:pb-0">
      <img className="block md:hidden" src={Img3} />
      <div className="px-[1rem] md:p-[4rem]">
        <h1 className="text-3xl md:text-5xl md:mt-16 mb-8 max-w-lg">
          <strong>{young.firstName}</strong>, ravi de vous retrouver&nbsp;!
        </h1>

        <p className="leading-relaxed">Votre espace volontaire vous accompagne à chaque étape de votre SNU.</p>

        <hr className="my-4" />

        <p className="text-xl font-bold leading-loose text-gray-700">Votre parcours</p>

        <Link to="/phase1">
          <p className="leading-loose">
            <span className="mr-2">1. Un séjour de cohésion</span>
            <Badge text={translatePhase1(young.statusPhase1)} color={PHASE_STATUS_COLOR[young.statusPhase1]} />
          </p>
        </Link>

        <Link to="/phase2">
          <p className="leading-loose">
            <span className="mr-2">2. Une phase d&apos;engagement</span>
            <Badge text={translatePhase2(young.statusPhase2)} color={PHASE_STATUS_COLOR[young.statusPhase2]} />
          </p>
        </Link>
      </div>
      <img className="flex-1 hidden xl:block" src={Img2} />
    </main>
  );
}
