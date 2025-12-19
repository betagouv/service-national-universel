import InfoMessage from "@/scenes/dashboardV2/components/ui/InfoMessage";
import { isAfter, isBefore } from "date-fns";
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
    start: new Date("2025-08-01"),
    end: new Date("2025-08-31"),
    message: "",
  },
  {
    start: new Date("2025-12-22"),
    end: new Date("2026-01-04"),
    message: "Le support du SNU sera exceptionnellement ralenti du 22 décembre au 4 janvier inclus. 🎄🎉✨ Pendant cette période, les délais de réponse seront plus longs.",
  },
];

const formatEndDate = (date: Date) => {
  return format(date, "d MMMM yyyy", { locale: fr });
};

export default function MessageDelayed() {
  const now = new Date();

  const currentPeriod = DELAYED_PERIODS.find((period) => isAfter(now, period.start) && isBefore(now, period.end));

  console.log("currentPeriod", currentPeriod);
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
