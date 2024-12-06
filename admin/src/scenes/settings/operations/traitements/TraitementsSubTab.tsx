import React from "react";

interface TraitementsSubTabProps {
  sessionId: string;
}

export default function TraitementsSubTab({ sessionId }: TraitementsSubTabProps) {
  return <div className="flex flex-col gap-8">Historique des traitements, à compléter</div>;
}
