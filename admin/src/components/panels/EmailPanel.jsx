import React from "react";
import { BiCopy, BiErrorCircle } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { formatLongDateFR } from "snu-lib";
import { capture } from "../../sentry";
import API from "../../services/api";
import { copyToClipboard, translateEmails } from "../../utils";
import PanelV2 from "../PanelV2";

export default function EmailPanel({ open, setOpen, email }) {
  const [emailData, setEmailData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const regex = /<(.*)@smtp-relay.mailin.fr>/;
  const ID = email.messageId.match(regex)?.[1];
  const events = formatEvents(emailData?.events) || [];

  function formatEvents(events) {
    if (!events) return [];
    let formattedEvents = [];
    let count = 1;
    const arr = events?.reverse();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].name === arr[i + 1]?.name) {
        count++;
      } else {
        formattedEvents.push({ ...arr[i], count });
        count = 1;
      }
    }
    return formattedEvents;
  }

  async function getMail(email) {
    try {
      const { ok, data } = await API.get("/email/" + email._id);
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
    <PanelV2 open={open} onClose={() => setOpen(false)} size="2xl" darkBg={false}>
      {loading ? (
        <p className="animate-pulse">Chargement...</p>
      ) : !emailData || emailData.error ? (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <BiErrorCircle />
          <p>Les données de cet email ne sont pas encore disponibles.</p>
        </div>
      ) : (
        emailData && (
          <div className="flex h-full flex-col gap-8">
            <div className="flex gap-2">
              <p className="text-base text-gray-500">Message ID : {ID}</p>
              <button
                className="flex items-center justify-center hover:scale-105"
                onClick={() => {
                  copyToClipboard(ID);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 3000);
                }}>
                {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-8">
              {events.map((event, index) => (
                <div key={index} className="space-y-2">
                  <p className="mx-auto text-center text-gray-800">
                    <span className="rounded-full bg-gray-100 px-3 py-1">{translateEmails(event.name)}</span>
                    <span> </span>
                    {event.count > 1 && <span className="rounded-full border px-3 py-1">x {event.count}</span>}
                  </p>
                  <p className="text-center text-gray-500">{formatLongDateFR(event.time)}</p>
                </div>
              ))}
            </div>
            <iframe srcDoc={emailData.body} className="flex-1 border-t" />
          </div>
        )
      )}
    </PanelV2>
  );
}
