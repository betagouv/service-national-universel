import React from "react";
import { knowledgebaseURL } from "@/config";
import { Card } from "@codegouvfr/react-dsfr/Card";

export default function Article({ article }) {
  return (
    <Card
      title={article.title}
      desc={article.description}
      enlargeLink
      linkProps={{
        href: `${knowledgebaseURL}/base-de-connaissance/${article.slug}`,
        target: "_blank",
        rel: "noopener noreferrer",
      }}
    />
  );
}
