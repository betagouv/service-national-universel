import React from "react";
import Engagement from "./components/Engagement";
import useAuth from "@/services/useAuth";
import Loader from "@/components/Loader";

export default function DelaiDepasse() {
  const { young } = useAuth();

  if (!young) return <Loader />;

  return (
    <div className="bg-white p-[1rem] md:p-[3.5rem] md:rounded-lg md:m-10 shadow-nina">
      <h1 className="text-gray-800 text-3xl md:text-5xl my-8">
        <strong>{young.firstName}</strong>, votre Phase 2 n'a pas été validée.
      </h1>
      <p className="text-gray-700 font-semibold">Le délai pour réaliser une mission d'intérêt général a été dépassé.</p>
      <p className="text-gray-700">Nous vous proposons de découvrir les autres formes d’engagement possible.</p>
      <hr className="mt-12 mb-8" />
      <Engagement />
    </div>
  );
}
