import React from "react";
import Article from "./Article";
import SecondaryButton from "@/components/dsfr/ui/buttons/SecondaryButton";
import plausibleEvent from "@/services/plausible";

export default function Solutions({ articles, showForm, setShowForm }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Solutions proposées</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {articles.map((e) => (
          <Article key={e.slug} article={e} />
        ))}
      </div>
      {!showForm && (
        <SecondaryButton
          className="my-8 w-full md:w-auto"
          onClick={() => {
            setShowForm(true);
            plausibleEvent("Besoin d'aide - Je n'ai pas trouve de reponse");
          }}>
          Ecrire au support
        </SecondaryButton>
      )}
    </div>
  );
}
