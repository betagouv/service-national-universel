import Img2 from "../../../assets/mission-domains/default.svg";
import React from "react";
import Sante from "../../../assets/mission-domaines/sante";
import Solidarite from "../../../assets/mission-domaines/solidarite";
import Citoyennete from "../../../assets/mission-domaines/citoyennete";
import Education from "../../../assets/mission-domaines/education";
import Sport from "../../../assets/mission-domaines/sport";
import DefenseEtMemoire from "../../../assets/mission-domaines/defense-et-memoire";
import Environment from "../../../assets/mission-domaines/environment";
import Securite from "../../../assets/mission-domaines/securite";
import Culture from "../../../assets/mission-domaines/culture";
import PreparationMilitaire from "../../../assets/mission-domaines/preparation-militaire";
import Equivalence from "@/assets/mission-domaines/equivalence";

const className = "text-white h-6 w-6";

const icon = {
  CITIZENSHIP: <Citoyennete className={className} />,
  CULTURE: <Culture className={className} />,
  DEFENSE: <DefenseEtMemoire className={className} />,
  EDUCATION: <Education className={className} />,
  ENVIRONMENT: <Environment className={className} />,
  HEALTH: <Sante className={className} />,
  SECURITY: <Securite className={className} />,
  SOLIDARITY: <Solidarite className={className} />,
  SPORT: <Sport className={className} />,
  PREPARATION_MILITARY: <PreparationMilitaire className={className} />,
  EQUIVALENCE: <Equivalence className={className} />,
};

export default function IconDomain({ domain, disabled = false }) {
  return (
    <div className={`flex items-center justify-center rounded-lg w-8 h-16 ${disabled ? "bg-gray-300" : "bg-[#212B44]"}`}>
      {icon[domain] || <img src={Img2} className="h-6 w-6" />}
    </div>
  );
}
