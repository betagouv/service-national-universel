import React from "react";
import NoSejourSection from "../components/NoSejourSection";
import ChangeSejourContainer from "../components/ChangeSejourContainer";

export default function NoMatchingDate() {
  return (
    <ChangeSejourContainer title="Aucune date ne me convient" backlink="/changer-de-sejour/">
      <p className="mt-4 text-sm leading-5 text-gray-500 font-normal text-center">Faites votre choix</p>
      <NoSejourSection />
    </ChangeSejourContainer>
  );
}
