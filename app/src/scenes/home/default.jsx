import React from "react";
import useAuth from "@/services/useAuth";
import { hasAccessToPhase3, permissionPhase3, PHASE_STATUS_COLOR, translate, translatePhase1, translatePhase2, YOUNG_STATUS, YOUNG_STATUS_PHASE3 } from "../../utils";
import Badge from "../../components/Badge";
import hero from "../../assets/hero/home.png";
import { Link } from "react-router-dom";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";

export default function HomeDefault() {
  const { young } = useAuth();
  const title = `${young.firstName}, ravi de vous retrouver !`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-4 leading-relaxed">Votre espace volontaire vous accompagne à chaque étape de votre SNU.</p>
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

        {hasAccessToPhase3(young) && (
          <Link to="/phase3">
            <p className="leading-loose">
              <span className="mr-2">3. Une phase d&apos;engagement volontaire</span>
              <Badge text={translate(young.statusPhase3)} color={PHASE_STATUS_COLOR[young.statusPhase3]} />
            </p>
          </Link>
        )}
      </HomeHeader>
    </HomeContainer>
  );
}
