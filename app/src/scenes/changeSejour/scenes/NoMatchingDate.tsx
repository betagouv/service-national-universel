import React from "react";
import NoSejourSection from "../components/NoSejourSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import Container from "@/components/layout/Container";

export default function NoMatchingDate() {
  return (
    <Container title="Aucune date ne me convient" backlink="/changer-de-sejour/">
      <CurrentSejourNotice />
      <p className="mt-4 text-sm leading-5 text-gray-500 font-normal text-center">Faites votre choix</p>
      <NoSejourSection />
    </Container>
  );
}
