import React from "react";
import { NavLink } from "react-router-dom";

import { DRAWER_TABS } from "../utils";
import { YOUNG_STATUS_PHASE2, ENABLE_PM } from "../../utils";
import DownloadAttestationButton from "../buttons/DownloadAttestationButton";

export default ({ young, handleClick }) => {
  const render = () => {
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED)
      return (
        <ul className="subNav">
          <li>
            <NavLink to="/candidature" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE2, "candidature")}>
              Consulter mes missions
            </NavLink>
          </li>
          {/* <li>
            <DownloadAttestationButton class="subNav-item" young={young} uri="2">
              Télécharger mon attestation
            </DownloadAttestationButton>
          </li> */}
        </ul>
      );
    else
      return (
        <ul className="subNav">
          <li>
            <NavLink to="/preferences" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE2, "preferences")}>
              Renseigner mes préférences
            </NavLink>
          </li>
          <li>
            <NavLink to="/mission" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE2, "mission")}>
              Trouver une mission
            </NavLink>
          </li>
          {ENABLE_PM && (
            <li>
              <NavLink to="/ma-preparation-militaire" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE2, "preparation-militaire")}>
                Ma préparation militaire
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/candidature" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE2, "candidature")}>
              Suivre mes candidatures
            </NavLink>
          </li>
        </ul>
      );
  };

  return render();
};
