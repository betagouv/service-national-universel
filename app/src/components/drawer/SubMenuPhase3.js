import React from "react";
import { NavLink } from "react-router-dom";

import { DRAWER_TABS } from "../utils";
import { YOUNG_STATUS_PHASE3 } from "../../utils";
import DownloadAttestationButton from "../buttons/DownloadAttestationButton";

export default ({ young, handleClick }) => {
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
            <DownloadAttestationButton class="subNav-item" young={young} uri="3">
              Télécharger mon attestation
            </DownloadAttestationButton>
          </li>
          <li>
            <NavLink to="/les-programmes" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3, "les-programmes")}>
              Les possibilités d'engagement
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
              Les programmes d'engagement
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
