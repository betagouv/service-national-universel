// Message d'indisponibilité temporaire de la plateforme (demande Sophie du 16/09/2026). Quatre lignes, rendues via `whitespace-pre-line`.
const CLOSURE_MESSAGE =
  "La plateforme SNU est temporairement indisponible.\n" +
  "Des vérifications sont actuellement en cours.\n" +
  "Nous vous informerons dès que possible de sa date de réouverture.\n" +
  "Merci pour votre compréhension.";

export default function ClosureBanner() {
  return (
    <section aria-label="Information sur la disponibilité de la plateforme SNU" className="border border-gray-200 bg-white p-4 flex items-center justify-center print:hidden">
      <div className="text-sm text-blue-800 font-bold px-4 md:px-32 text-center">
        <p className="whitespace-pre-line">{CLOSURE_MESSAGE}</p>
      </div>
    </section>
  );
}
