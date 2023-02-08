import React from "react";
import { formatLongDateFR } from "snu-lib";
import TailwindPanelWide from "../../../TailwindPanelWide";

export default function Email({ email }) {
  const [open, setOpen] = React.useState(false);

  function handleClick() {
    setOpen(!open);
  }

  return (
    <>
      <tr className="border-t border-t-slate-100 hover:bg-slate-50 cursor-pointer rounded-xl" onClick={handleClick}>
        <td className="px-4 py-3">
          <p className="text-gray-400 truncate">{email.subject}</p>
          <p>Description</p>
        </td>
        <td className="px-4 py-3 truncate text-gray-800">{formatLongDateFR(email.date)}</td>
        <td className="px-4 py-3 truncate">{email.templateId || ""}</td>
      </tr>
      <EmailPanel open={open} setOpen={setOpen} email={email} />
    </>
  );
}

function EmailPanel({ open, setOpen, email }) {
  const [emailData, setEmailData] = React.useState(null);
  console.log("🚀 ~ file: Email.js:28 ~ EmailPanel ~ emailData", emailData);

  async function getMail(email) {
    const response = await fetch(`https://api.sendinblue.com/v3/smtp/email/${email.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.SENDINBLUEKEY,
      },
    });
    const data = await response.json();
    return data;
  }

  React.useEffect(() => {
    if (open) {
      getMail(email).then((data) => {
        setEmailData(data);
      });
    }
  }, [open]);

  return (
    <TailwindPanelWide open={open} setOpen={setOpen} title={email.subject}>
      {emailData.subject ? (
        <>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="flex flex-col">
                <p className="text-gray-400">From</p>
                <p className="text-gray-800">{emailData.sender.email}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">To</p>
                <p className="text-gray-800">{emailData.to[0].email}</p>
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
            <p className="text-gray-800">{emailData.body}</p>
          </div>
        </>
      ) : (
        <p className="animate-pulse">Chargement...</p>
      )}
    </TailwindPanelWide>
  );
}
