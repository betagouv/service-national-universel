import React from "react";
import { useSelector } from "react-redux";

import Engagement from "./components/Engagement";

export default function Excluded() {
  const young = useSelector((state) => state.Auth.young);

  return (
    <div className="flex w-full lg:w-fit flex-col-reverse lg:flex-row bg-white lg:rounded-xl lg:m-10 bg-white lg:shadow-md">
      <div className="space-y-10 p-4 lg:m-16">
        <p className="max-w-4xl text-5xl font-medium leading-tight tracking-tight text-gray-900">
          <strong>{young.firstName}, </strong>
          votre séjour de cohésion n&apos;a pas été validé pour motif d&apos;exclusion.
        </p>
        <p>
          <strong>Vous ne pouvez donc pas poursuivre votre parcours d’engagement au sein du SNU.</strong>
          <br />
          Nous vous proposons de découvrir les autres formes d’engagement possible.
        </p>
        <Engagement />
      </div>
    </div>
  );
}
