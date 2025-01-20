import React from "react";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3, FEATURES_NAME, isFeatureEnabled } from "snu-lib";
import { environment, knowledgebaseURL } from "../../../../config";
import { hasAccessToPhase3, permissionPhase1, permissionPhase2, permissionPhase3 } from "../../../../utils";
import plausibleEvent from "@/services/plausible";

import Diagoriente from "./Diagoriente";
import IconHome from "../assets/IconHome";
import IconPhase1 from "../assets/IconPhase1";
import IconPhase2 from "../assets/IconPhase2";
import IconPhase3 from "../assets/IconPhase3";
import MenuGroup from "./MenuGroup";
import MenuLink from "./MenuLink";
import Socials from "./Socials";
import { GoTools } from "react-icons/go";
import MenuLinkExternal from "./MenuLinkExternal";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { CiPalette } from "react-icons/ci";
import usePermissions from "@/hooks/usePermissions";

export default function NavigationMenu({ onClose = () => {} }) {
  const young = useSelector((state) => state.Auth.young);
  const { hasAccessToNavigation } = usePermissions();

  return (
    <nav className="flex h-full w-full flex-col justify-between bg-[#212B44] p-[24px] transition-all md:flex-1 md:p-[8px] md:pb-[24px]">
      <ul>
        <MenuLink to="/" icon={<IconHome />} text="Accueil" onClose={onClose} />
        <MenuLink
          to="/phase1"
          icon={<IconPhase1 />}
          text="Phase 1 - Séjour"
          enabled={hasAccessToNavigation && permissionPhase1(young)}
          status={young.statusPhase1}
          onClose={onClose}
        />
        <MenuLink
          to="/phase2"
          icon={<IconPhase2 />}
          text="Phase 2 - Engagement"
          enabled={hasAccessToNavigation && permissionPhase2(young)}
          status={young.statusPhase2}
          onClose={onClose}></MenuLink>
        {hasAccessToPhase3(young) && (
          <MenuGroup to="/phase3" icon={<IconPhase3 />} text="Phase 3" enabled={permissionPhase3(young)} status={young.statusPhase3} onClose={onClose}>
            <MenuLink to="/les-programmes" text="Les programmes" onClose={onClose} />
            <MenuLink to="/phase3/mission" text="Trouver une mission" onClose={onClose} />
            <MenuLink to="/phase3/valider" text="Valider ma phase 3" onClose={onClose} />
          </MenuGroup>
        )}
        <div className="m-8" />
        <MenuLinkExternal
          onClick={plausibleEvent("Compte/Besoin d'aide")}
          href={knowledgebaseURL}
          icon={<HiOutlineQuestionMarkCircle className="text-lg stroke-[1.5]" />}
          text="Besoin d'aide ?"
          onClose={onClose}
        />
        {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <MenuLink to="develop-assets" icon={<GoTools />} text="Dev tools" onClose={onClose} />}
        {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <MenuLink to="design-system" icon={<CiPalette />} text="Design system" onClose={onClose} />}
      </ul>
      <Diagoriente />
      <Socials />
    </nav>
  );
}
