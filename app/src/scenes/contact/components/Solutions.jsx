import React from "react";
import Article from "./Article";

export default function Solutions({ articles }) {
  return (
    <section id="solutions" className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Solutions proposées</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {articles.map((e) => (
          <Article key={e.slug} article={e} />
        ))}
      </div>
    </section>
  );
}
