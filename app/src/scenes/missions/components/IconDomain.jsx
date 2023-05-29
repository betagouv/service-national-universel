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

export default function IconDomain({ domain, bgStyle = null, iconStyle = "text-white h-8 w-8" }) {
  const [icon, setIcon] = React.useState(null);

  React.useEffect(() => {
    switch (domain) {
      case "CITIZENSHIP":
        setIcon(<Citoyennete className={iconStyle} />);
        break;
      case "CULTURE":
        setIcon(<Culture className={iconStyle} />);
        break;
      case "DEFENSE":
        setIcon(<DefenseEtMemoire className={iconStyle} />);
        break;
      case "EDUCATION":
        setIcon(<Education className={iconStyle} />);
        break;
      case "ENVIRONMENT":
        setIcon(<Environment className={iconStyle} />);
        break;
      case "HEALTH":
        setIcon(<Sante className={iconStyle} />);
        break;
      case "SECURITY":
        setIcon(<Securite className={iconStyle} />);
        break;
      case "SOLIDARITY":
        setIcon(<Solidarite className={iconStyle} />);
        break;
      case "SPORT":
        setIcon(<Sport className={iconStyle} />);
        break;
      case "PREPARATION_MILITARY":
        setIcon(<PreparationMilitaire className={iconStyle} />);
        break;
    }
  }, [domain]);

  return domain ? (
    <div className={`flex items-center rounded-xl py-3 px-1.5  ${bgStyle ? bgStyle : "bg-[#212B44]"}`}>{icon}</div>
  ) : (
    <div className={`flex items-center rounded-xl py-3 px-1.5  ${bgStyle ? bgStyle : "bg-[#212B44]"} `}>
      <img className="h-8 w-8" src={Img2} style={{}} />
    </div>
  );
}
