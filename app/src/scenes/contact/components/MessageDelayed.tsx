import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Alert from "@/components/dsfr/ui/Alert";

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
    <Alert className="my-8">
      <p className="text-lg font-semibold">Délai de traitement des messages ralenti</p>
      <p>
        Bonjour,
        <br />
        <br />
        Le délai de traitement des messages est ralenti jusqu'au {formatEndDate(currentPeriod.end)}. En attendant, nous vous invitons à consulter{" "}
        <a href="https://support.snu.gouv.fr/base-de-connaissance">notre centre d'aide</a> puis à nous envoyer un message si vous ne trouvez pas de réponse à votre question.
        <br />
        <br />
        {currentPeriod.message}
      </p>
    </Alert>
  );
}
