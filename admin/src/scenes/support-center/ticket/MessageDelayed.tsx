import InfoMessage from "@/scenes/dashboardV2/components/ui/InfoMessage";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

interface Period {
  start: Date;
  end: Date;
  message: string;
}

const DELAYED_PERIODS: Period[] = [
  {
    start: new Date("2026-08-01T00:00:00"),
    end: new Date("2026-09-01T23:59:59.999"),
    message: "Le support du SNU sera exceptionnellement ralenti du 1er août au 1er septembre inclus. 🏝️ Pendant cette période, les délais de réponse seront plus longs.",
  },
  {
    start: new Date("2024-12-23"),
    end: new Date("2025-01-06"),
    message: "Nous vous souhaitons de très belles fêtes",
  },
];

const formatEndDate = (date: Date) => {
  return format(date, "do MMMM yyyy", { locale: fr });
};

export default function MessageDelayed() {
  const now = new Date();

  const currentPeriod = DELAYED_PERIODS.find((period) => now >= period.start && now <= period.end);

  if (!currentPeriod) {
    return null;
  }

  return (
    <InfoMessage
      title={"Délai de traitement des messages ralenti"}
      message={`
Bonjour, 

Le délai de traitement des messages est ralenti jusqu'au ${formatEndDate(currentPeriod.end)}.

En attendant, nous vous invitons à consulter [notre centre d'aide](https://support.snu.gouv.fr/base-de-connaissance) puis à nous envoyer un message si vous ne trouvez pas de réponse à votre question.

${currentPeriod.message}
`}
      priority="important"
      className="mb-6"
    />
  );
}
