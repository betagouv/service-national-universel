import React from "react";
import Container from "@/components/layout/Container";

export function EquivalenceSubmissionNotice() {
  return <p>Vous ne pouvez plus déposer de demande de reconnaissance depuis votre espace.</p>;
}

export default function EquivalenceSubmissionClosed() {
  return (
    <Container title="Faire reconnaître un engagement déjà réalisé" backlink="/phase2">
      <div className="mx-auto max-w-2xl">
        <EquivalenceSubmissionNotice />
      </div>
    </Container>
  );
}
