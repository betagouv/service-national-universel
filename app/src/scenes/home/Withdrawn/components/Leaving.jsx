import React from "react";
import { Content, Hero, HeroContainer, Separator, VioletButton } from "@/components/Content";
import useAuth from "@/services/useAuth";
import { Link } from "react-router-dom";
import plausibleEvent from "@/services/plausible";
import { isCle, translate } from "snu-lib";

export default function Leaving() {
  const { young } = useAuth();
  return (
    <HeroContainer>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> dommage que vous nous quittiez !
          </h1>
          <p>Votre désistement du SNU {isCle(young) && "dans le cadre des classes engagées "}a bien été pris en compte.</p>
          <p>Si l&apos;engagement vous donne envie, vous trouverez ci-dessous des dispositifs qui pourront vous intéresser.</p>
          <p>
            Bonne continuation, <br />
            Les équipes du Service National Universel
          </p>
          <Separator />
          <Link to="/les-programmes" onClick={() => plausibleEvent("CTA désisté - Autres possibilités d'engagement", { statut: translate(young.status) })}>
            <VioletButton>Consulter les autres possibilités d&apos;engagement</VioletButton>
          </Link>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}
