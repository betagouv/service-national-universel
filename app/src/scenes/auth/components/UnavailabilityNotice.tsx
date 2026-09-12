import React from "react";
import Notice from "@/components/ui/alerts/Notice";

// Message d'indisponibilité de la plateforme (demande PO du 12/09/2026).
// Quatre lignes, rendues via `whitespace-pre-line`.
const UNAVAILABILITY_MESSAGE =
  "La plateforme SNU est temporairement indisponible.\n" +
  "Des vérifications sont actuellement en cours.\n" +
  "Nous vous informerons dès que possible de sa date de réouverture.\n" +
  "Merci pour votre compréhension.";

export default function UnavailabilityNotice() {
  return (
    <section aria-label="Information sur l'indisponibilité de la plateforme SNU" className="mb-4">
      <Notice>
        <p className="whitespace-pre-line">{UNAVAILABILITY_MESSAGE}</p>
      </Notice>
    </section>
  );
}
