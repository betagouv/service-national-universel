const JEUNES_GOUV_URL = "https://jeunes.gouv.fr/";

// Message de fermeture de la plateforme (demande PO du 04/09/2026). Trois lignes, rendues via `whitespace-pre-line`.
const CLOSURE_MESSAGE =
  "Le SNU n’est plus reconduit et la plateforme SNU fermera définitivement le 15 décembre 2026.\n" +
  "Volontaires de 2024 et 2025, pensez à récupérer vos attestations !\n" +
  "L’engagement des jeunes se déploie à travers de nombreux autres dispositifs. Retrouvez-les sur ";

export default function ClosureBanner() {
  return (
    <section aria-label="Information sur la fermeture de la plateforme SNU" className="border border-gray-200 bg-white p-4 flex items-center justify-center print:hidden">
      <div className="text-sm text-blue-800 font-bold px-4 md:px-32 text-center">
        <p className="whitespace-pre-line">
          {CLOSURE_MESSAGE}
          <a href={JEUNES_GOUV_URL} target="_blank" rel="noreferrer" className="underline">
            jeunes.gouv.fr
          </a>
          .
        </p>
      </div>
    </section>
  );
}
