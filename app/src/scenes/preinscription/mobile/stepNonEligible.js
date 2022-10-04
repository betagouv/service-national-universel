import React from "react";
import { Link, useHistory } from "react-router-dom";

export default function NonEligible() {
  const history = useHistory();

  return (
    <div className="bg-white p-4">
      <h1 className="text-2xl font-semibold">Vous n’êtes malheureusement pas éligible au SNU.</h1>
      <div className="font-semibold my-4">Découvrez d’autres formes d’engagement</div>
      <div className="overflow-x-auto">
        <div className="flex w-96 gap-4">
          <div className="w-64 border">
            <div className="font-semibold m-4">Service civique</div>
            <div className="m-4">Blabla</div>
          </div>
          <div className="w-64 border">
            <div className="font-semibold m-4">JeVeuxAider.org</div>
            <div className="m-4">Blabla</div>
            <div className="text-right">{`->`}</div>
          </div>
        </div>
      </div>
      <div
        className="text-blue-600 text-center border-2 border-blue-600 my-4 p-2"
        onClick={() => {
          history.push("https://www.jeveuxaider.gouv.fr/");
        }}>
        Voir plus de formes d’engagement
      </div>
    </div>
  );
}
