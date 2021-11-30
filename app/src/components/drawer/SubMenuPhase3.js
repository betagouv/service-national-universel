import React from "react";
import { NavLink } from "react-router-dom";

import { DRAWER_TABS } from "../utils";
import { YOUNG_STATUS_PHASE3 } from "../../utils";

const SubMenuPhase3 = ({ young, handleClick }) => {
  const render = () => {
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED)
      return (
        <ul className="subNav">
          <li>
            <NavLink to="/phase3/valider" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "valider")}>
              Consulter ma mission
            </NavLink>
          </li>
          <li>
            <NavLink to="/les-programmes" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "les-programmes")}>
              Les possibilités d&apos;engagement
            </NavLink>
          </li>
          <li>
            <NavLink to="/phase3/mission" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "mission")}>
              Trouver une mission
            </NavLink>
          </li>
        </ul>
      );
    else
      return (
        <ul className="subNav">
          <li>
            <NavLink to="/les-programmes" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "les-programmes")}>
              Les programmes d&apos;engagement
            </NavLink>
          </li>
          <li>
            <NavLink to="/phase3/mission" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "mission")}>
              Trouver une mission
            </NavLink>
          </li>
          <li>
            <NavLink to="/phase3/valider" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "valider")}>
              Valider ma phase 3
            </NavLink>
          </li>
        </ul>
      );
  };

  return render();
};

export default SubMenuPhase3;
