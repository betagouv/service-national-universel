import React from "react";
import { supportURL, adminURL } from "../config";
import { useSelector } from "react-redux";
import QuestionMark from "../assets/QuestionMark";
import plausibleEvent from "../services/pausible";

export default function HelpButton() {
  const user = useSelector((state) => state.Auth.user);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen((e) => !e);
    setTimeout(() => setOpen(false), 10000);
  };

  const LISTE_LIEN_AIDE_PAR_ROLE = {
    admin: [
      {
        label: "Aide et tutoriels",
        url: supportURL,
      },
      {
        label: "Contacter le support national",
        url: `${adminURL}/besoin-d-aide/ticket`,
      },
      {
        label: "Mes messages",
        url: `${adminURL}/boite-de-reception`,
      },
    ],
    referent_department: [
      {
        label: "Aide et tutoriels",
        url: supportURL,
      },
      {
        label: "Contacter le support national",
        url: `${adminURL}/besoin-d-aide/ticket`,
      },
      {
        label: "Mes messages",
        url: `${adminURL}/boite-de-reception`,
      },
      {
        label: "Forum collaboratif - Osmose",
        url: "https://osmose.numerique.gouv.fr/jcms/c_2075355/fr/service-national-universel",
      },
    ],
    referent_region: [
      {
        label: "Aide et tutoriels",
        url: supportURL,
      },
      {
        label: "Contacter le support national",
        url: `${adminURL}/besoin-d-aide/ticket`,
      },
      {
        label: "Mes messages",
        url: `${adminURL}/boite-de-reception`,
      },
      {
        label: "Forum collaboratif - Osmose",
        url: "https://osmose.numerique.gouv.fr/jcms/c_2075355/fr/service-national-universel",
      },
    ],
    head_center: [
      {
        label: "Aide et tutoriels",
        url: supportURL,
      },
      {
        label: "Contacter mon référent départemental",
        url: `${adminURL}/besoin-d-aide/ticket`,
      },
      {
        label: "Mes messages",
        url: `${adminURL}/boite-de-reception`,
      },
    ],
    responsible: [
      {
        label: "Aide et tutoriels",
        url: supportURL,
      },
      {
        label: "Contacter mon référent départemental",
        url: `${adminURL}/besoin-d-aide/ticket`,
      },
      {
        label: "Mes messages",
        url: `${adminURL}/boite-de-reception`,
      },
    ],
    supervisor: [
      {
        label: "Aide et tutoriels",
        url: supportURL,
      },
      {
        label: "Contacter mon référent départemental",
        url: `${adminURL}/besoin-d-aide/ticket`,
      },
      {
        label: "Mes messages",
        url: `${adminURL}/boite-de-reception`,
      },
    ],
  };

  if (!user) return null;

  return (
    <>
      {/* // big button */}
      <div
        className="hidden lg:flex fixed bottom-10 left-10 justify-center z-20 bg-snu-purple-900"
        onClick={() => {
          handleOpen();
          plausibleEvent("Menu/CTA - Besoin Aide");
        }}>
        <div
          className="flex items-center border rounded p-2 text-white hover:!text-white hover:bg-snu-purple-800 hover:shadow-lg cursor-pointer"
          activeClassName="flex bg-snu-purple-300 p-2">
          <QuestionMark class="h-6 w-6 flex mr-2 " />
          <div>
            <div className="font-normal text-sm text-center">Besoin d&apos;aide ?</div>
            <div className="font-light text-xs float-right text-center ">Tutoriels, contacts</div>
          </div>
        </div>
        <div
          className={`${
            open ? "block" : "hidden"
          } group-hover:block min-w-[250px] rounded-lg bg-white transition absolute left-[calc(100%+10px)] bottom-0 border-3 border-red-600 shadow-sm overflow-hidden`}>
          {(LISTE_LIEN_AIDE_PAR_ROLE[user.role] || []).map((e) => (
            <a key={e.label} href={e.url} target="_blank" rel="noreferrer">
              <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-coolGray-800 hover:text-coolGray-800">
                {e.label}
              </div>
            </a>
          ))}
        </div>
      </div>
      {/* // small button */}
      <div
        className="flex lg:hidden fixed bottom-5 left-5 justify-center z-20"
        onClick={() => {
          handleOpen();
          plausibleEvent("Menu/CTA - Besoin Aide");
        }}>
        <div
          className="flex items-center rounded-full text-snu-purple-800 bg-[#FFFFFFAA] hover:!text-white hover:bg-snu-purple-800 hover:shadow-lg cursor-pointer"
          activeClassName="flex bg-snu-purple-300 p-2">
          <QuestionMark class="h-8 w-8 flex" />
        </div>
        <div
          className={`${
            open ? "block" : "hidden"
          } group-hover:block min-w-[250px] rounded-lg bg-white transition absolute left-[calc(100%+10px)] bottom-0 border-3 border-red-600 shadow-sm overflow-hidden`}>
          {(LISTE_LIEN_AIDE_PAR_ROLE[user.role] || []).map((e) => (
            <a key={e.label} href={e.url} target="_blank" rel="noreferrer">
              <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-coolGray-800 hover:text-coolGray-800">
                {e.label}
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
