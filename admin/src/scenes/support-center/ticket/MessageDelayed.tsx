import InfoMessage from "@/scenes/dashboardV2/components/ui/InfoMessage";
import { isAfter, isBefore } from "date-fns";
import React from "react";

export default function MessageDelayed() {
  // returns true
  if (!isAfter(new Date(), new Date("2024-12-23")) || !isBefore(new Date(), new Date("2025-01-06"))) {
    return null;
  }
  return (
    <InfoMessage
      title={"Délai de traitement des messages ralenti"}
      message={`
Bonjour, 

Le délai de traitement des messages est ralenti jusqu’au 6 janvier 2025.

En attendant, nous vous invitons à consulter [notre centre d’aide](https://support.snu.gouv.fr/base-de-connaissance) puis à nous envoyer un message si vous ne trouvez pas de réponse à votre question.

Nous vous souhaitons de très belles fêtes
`}
      priority="important"
      className="mb-6"
    />
  );
}
