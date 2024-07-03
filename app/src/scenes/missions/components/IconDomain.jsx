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

const icon = {
  CITIZENSHIP: <Citoyennete className="text-white h-8 w-8" />,
  CULTURE: <Culture className="text-white h-8 w-8" />,
  DEFENSE: <DefenseEtMemoire className="text-white h-8 w-8" />,
  EDUCATION: <Education className="text-white h-8 w-8" />,
  ENVIRONMENT: <Environment className="text-white h-8 w-8" />,
  HEALTH: <Sante className="text-white h-8 w-8" />,
  SECURITY: <Securite className="text-white h-8 w-8" />,
  SOLIDARITY: <Solidarite className="text-white h-8 w-8" />,
  SPORT: <Sport className="text-white h-8 w-8" />,
  PREPARATION_MILITARY: <PreparationMilitaire className="text-white h-8 w-8" />,
};

export default function IconDomain({ domain }) {
  return <div className="flex items-center rounded-lg w-8 h-12 bg-[#212B44]">{icon[domain] || <img src={Img2} className="h-8 w-8" />}</div>;
}
