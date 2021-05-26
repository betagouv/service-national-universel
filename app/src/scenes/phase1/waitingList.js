import React from "react";
import { useSelector } from "react-redux";

import { HeroContainer, Hero } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <>
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              <strong>{young.firstName}</strong>, bienvenue dans votre espace personnel.
            </h1>
            <p>
              <b>Les inscriptions au SNU édition 2021 sont victimes de leur succès et nous tentons de trouver des places pour tous les candidats.</b>
            </p>
            <p>L’administration du SNU vous recontactera au plus vite pour vous informer de votre participation au séjour du 21 juin au 2 juillet 2021 .</p>
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
    </>
  );
};
