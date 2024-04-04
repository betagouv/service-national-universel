import React from "react";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";

export default function FutureCohort() {
  return (
    <DSFRLayout title="Inscription au SNU">
      <main className="md:flex-none mx-auto w-full bg-white px-[1rem] py-[2rem] shadow-sm md:w-[56rem] md:px-[6rem] md:py-[4rem] space-y-4 md:space-y-8">
        <h1 className="text-xl md:text-3xl font-bold">Vous êtes en cours d'inscription au SNU pour un séjour à venir.</h1>
        <hr />
        <p className="md:text-lg">
          Votre inscription a été reportée sur<strong> un prochain séjour </strong> dont les dates vous seront communiquées ultérieurement.
        </p>
      </main>
    </DSFRLayout>
  );
}
