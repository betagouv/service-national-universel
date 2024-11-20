import React from "react";

interface TraitementsSubTabProps {
  cohortId: string;
}

export default function TraitementsSubTab({ cohortId }: TraitementsSubTabProps) {
  return <div className="flex flex-col gap-8">Historique des traitements, à compléter</div>;
}
