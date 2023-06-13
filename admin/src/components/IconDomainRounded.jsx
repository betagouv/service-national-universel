import React from "react";
import Sante from "../assets/iconDomain/sante";
import Solidarite from "../assets/iconDomain/solidarite";
import Citoyennete from "../assets/iconDomain/citoyennete";
import Education from "../assets/iconDomain/education";
import Sport from "../assets/iconDomain/sport";
import DefenseEtMemoire from "../assets/iconDomain/defense-et-memoire";
import Environment from "../assets/iconDomain/environment";
import Securite from "../assets/iconDomain/securite";
import Culture from "../assets/iconDomain/culture";
import PreparationMilitaire from "../assets/iconDomain/preparation-militaire";
import Default from "../assets/iconDomain/default.svg";

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
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl  p-1.5 ${bgStyle ? bgStyle : "bg-[#212B44]"}`}>{icon}</div>
  ) : (
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl p-1.5 ${bgStyle ? bgStyle : "bg-[#212B44]"} `}>
      <img className="h-8 w-8" src={Default} style={{}} />
    </div>
  );
}
