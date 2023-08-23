import React from "react";
import Header from "../../components/header";
import Footer from "@/components/dsfr/components/Footer";

export default function FutureCohort() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-beige-gris-galet-975">
      <Header />
      <main className="flex-1 md:flex-none mx-auto w-full bg-white px-[1rem] py-[2rem] shadow-sm md:w-[56rem] md:px-[6rem] md:py-[4rem] space-y-4 md:space-y-8">
        <h1 className="text-xl md:text-3xl font-bold">Vous êtes en cours d'inscription au SNU pour un séjour à venir.</h1>
        <hr />
        <p className="md:text-lg">
          <strong>Les inscriptions ont été clôturées</strong> pour les sessions du premier semestre 2023. L'administration reviendra vers vous pour vous prévenir de l'ouverture des
          prochaines inscriptions.
        </p>
      </main>
      <Footer />
    </div>
  );
}
