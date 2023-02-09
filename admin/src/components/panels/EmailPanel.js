import React from "react";
import { toastr } from "react-redux-toastr";
import { formatLongDateFR } from "snu-lib";
import { capture } from "../../sentry";
import API from "../../services/api";
import TailwindPanelWide from "./TailwindPanelWide";

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
    <TailwindPanelWide open={open} setOpen={setOpen} title={email?.subject}>
      {loading && <p className="animate-pulse">Chargement...</p>}
      {emailData && (
        <>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="flex flex-col">
                <p className="text-gray-400">From</p>
                <p className="text-gray-800">{emailData.sender}</p>
              </div>
              {/* <div className="flex flex-col">
                <p className="text-gray-400">To</p>
                <p className="text-gray-800">{email.to[0].email}</p>
              </div> */}
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col">
                <p className="text-gray-400">Template</p>
                <p className="text-gray-800">{emailData.templateId}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Date</p>
                <p className="text-gray-800">{formatLongDateFR(emailData.date)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-gray-400">Subject</p>
            <p className="text-gray-800">{emailData.subject}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-gray-400">Body</p>
            <div dangerouslySetInnerHTML={{ __html: emailData.body }} />
          </div>
        </>
      )}
    </TailwindPanelWide>
  );
}
