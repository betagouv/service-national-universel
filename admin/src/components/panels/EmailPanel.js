import React from "react";
import { toastr } from "react-redux-toastr";
import { formatLongDateFR } from "snu-lib";
import { capture } from "../../sentry";
import API from "../../services/api";
import { translateEmails } from "../../utils";
import PanelV2 from "../PanelV2";

export default function EmailPanel({ open, setOpen, email }) {
  const [emailData, setEmailData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  async function getMail(email) {
    try {
      const { ok, data } = await API.get("/email/" + email.messageId);
      if (!ok) {
        capture("Impossible de récupérer les données de l'email" + JSON.stringify(email));
        toastr.error("Erreur", "Impossible de récupérer les données de l'email");
        return setLoading(false);
      }
      setEmailData(data);
      setLoading(false);
    } catch (error) {
      toastr.error("Erreur", "Impossible de récupérer les données de l'email");
    }
  }

  React.useEffect(() => {
    if (open) {
      getMail(email);
    }
  }, [open]);

  return (
    <PanelV2 open={open} onClose={() => setOpen(false)} title={`Message ID: ${email?.messageId}`} size="2xl" darkBg={false}>
      {loading && <p className="animate-pulse">Chargement...</p>}
      {emailData && (
        <>
          <div className="flex flex-wrap gap-6">
            {emailData.events.map((event, index) => (
              <div key={index} className="w-32">
                <p className="w-min mx-auto text-sm text-center text-gray-800 bg-gray-100 rounded-full px-3 py-1 m-1">{translateEmails(event.name)}</p>
                <p className="text-sm text-center text-gray-500">{formatLongDateFR(event.time)}</p>
              </div>
            ))}
          </div>
          <div dangerouslySetInnerHTML={{ __html: emailData.body }} />
        </>
      )}
    </PanelV2>
  );
}
