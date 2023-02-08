import React from "react";
import { toastr } from "react-redux-toastr";
import { formatLongDateFR, translate } from "snu-lib";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";
import { htmlCleaner } from "../../../../utils";
import Loader from "../../../Loader";
import TailwindPanelWide from "../../../TailwindPanelWide";

export default function Email({ email }) {
  console.log("🚀 ~ file: Email.js:10 ~ Email ~ email", email);
  const [open, setOpen] = React.useState(false);

  function handleClick() {
    setOpen(!open);
  }

  return (
    <>
      <tr
        aria-checked={open}
        className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer rounded-xl aria-checked:bg-blue-500 aria-checked:text-white transition"
        onClick={handleClick}>
        <td className="px-4 py-3">
          <p className="font-bold max-w-lg truncate">{email.subject}</p>
          <p>{translate(email.event)}</p>
        </td>
        <td className="px-4 py-3 truncate">{formatLongDateFR(email.date)}</td>
        <td className="px-4 py-3 truncate">{email.templateId || ""}</td>
      </tr>
      <EmailPanel open={open} setOpen={setOpen} email={email} />
    </>
  );
}

function EmailPanel({ open, setOpen, email }) {
  const [emailData, setEmailData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  console.log("🚀 ~ file: Email.js:28 ~ EmailPanel ~ emailData", emailData);

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

  // ! TRaduction en FR

  return (
    <TailwindPanelWide open={open} setOpen={setOpen} title={email?.subject}>
      {!loading ? (
        <>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="flex flex-col">
                <p className="text-gray-400">From</p>
                <p className="text-gray-800">{email.sender}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">To</p>
                <p className="text-gray-800">{email.to[0].email}</p>
              </div>
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
            <div dangerouslySetInnerHTML={{ __html: htmlCleaner(emailData.body) }} />
          </div>
        </>
      ) : (
        <p className="animate-pulse">Chargement...</p>
      )}
    </TailwindPanelWide>
  );
}
