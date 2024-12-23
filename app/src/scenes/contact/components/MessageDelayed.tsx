import React from "react";
import { isAfter, isBefore } from "date-fns";
import Alert from "@/components/dsfr/ui/Alert";

export default function MessageDelayed() {
  if (!isAfter(new Date(), new Date("2024-12-23")) || !isBefore(new Date(), new Date("2025-01-06"))) {
    return null;
  }
  return (
    <Alert className="my-8">
      <p className="text-lg font-semibold">Délai de traitement des messages ralenti</p>
      <p>
        Bonjour,
        <br />
        <br />
        Le délai de traitement des messages est ralenti jusqu’au 6 janvier 2025. En attendant, nous vous invitons à consulter{" "}
        <a href="https://support.snu.gouv.fr/base-de-connaissance">notre centre d’aide</a> puis à nous envoyer un message si vous ne trouvez pas de réponse à votre question.
        <br />
        <br />
        Nous vous souhaitons de très belles fêtes
      </p>
    </Alert>
  );
}
