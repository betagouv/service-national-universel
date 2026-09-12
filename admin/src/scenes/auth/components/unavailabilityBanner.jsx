import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";

// Message d'indisponibilité de la plateforme (demande PO du 12/09/2026).
// Quatre lignes, rendues via `whitespace-pre-line`.
const UNAVAILABILITY_MESSAGE =
  "La plateforme SNU est temporairement indisponible.\n" +
  "Des vérifications sont actuellement en cours.\n" +
  "Nous vous informerons dès que possible de sa date de réouverture.\n" +
  "Merci pour votre compréhension.";

export default function UnavailabilityBanner() {
  return (
    <section aria-label="Information sur l'indisponibilité de la plateforme SNU" className="mb-8 flex gap-3 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
      <div className="flex-none">
        <HiOutlineInformationCircle className="h-5 w-5 text-blue-800" />
      </div>
      <p className="whitespace-pre-line">{UNAVAILABILITY_MESSAGE}</p>
    </section>
  );
}
