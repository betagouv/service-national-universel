import React from "react";
import { toastr } from "react-redux-toastr";
import { NavLink, useHistory, useParams } from "react-router-dom";
import Bus from "../../../assets/icons/Bus";
import ClipboardList from "../../../assets/icons/ClipboardList";
import Menu from "../../../assets/icons/Menu";
import PencilAlt from "../../../assets/icons/PencilAlt";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import SelectAction from "../../../components/SelectAction";
import { environment } from "../../../config";
import api from "../../../services/api";
import ModalExportMail from "../components/modals/ModalExportMail";
import FicheSanitaire from "./fiche-sanitaire";
import General from "./general";
import Pointage from "./pointage";

export default function CenterYoungIndex() {
  if (environment === "production") return null;

  const [modalExportMail, setModalExportMail] = React.useState({ isOpen: false });

  const history = useHistory();
  const { id, sessionId, currentTab } = useParams();

  React.useEffect(() => {
    const listTab = ["general", "tableau-de-pointage", "fiche-sanitaire"];
    if (!listTab.includes(currentTab)) history.push(`/centre/${id}/${sessionId}/general`);
  }, [currentTab]);

  return (
    <>
      <div className="m-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl mb-4">Volontaires</div>
          <SelectAction
            title="Exporter les volontaires"
            alignItems="right"
            buttonClassNames="bg-blue-600"
            textClassNames="text-white font-medium text-sm"
            rightIconClassNames="text-blue-300"
            optionsGroup={[
              {
                title: "Télécharger",
                items: [
                  {
                    action: async () => {},
                    render: (
                      <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <ClipboardList className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                        <div>Informations complètes</div>
                      </div>
                    ),
                  },
                ],
              },
              {
                title: "Envoyer par mail",
                items: [
                  {
                    action: async () => {
                      setModalExportMail({
                        isOpen: true,
                        onSubmit: async (emails) => {
                          const { ok } = await api.post(`/session-phase1/${sessionId}/share`, { emails });
                          if (!ok) toastr.error("Oups, une erreur s'est produite");
                          toastr.success("Un mail a été envoyé à tous les destinataires renseignés");
                          setModalExportMail({ isOpen: false });
                        },
                      });
                    },
                    render: (
                      <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                        <div>Informations transports</div>
                      </div>
                    ),
                  },
                ],
              },
            ]}
          />
        </div>
        <div className=" flex flex-1 flex-col lg:flex-row">
          <nav className="flex flex-1 gap-1">
            <TabItem icon={<Menu />} title="Général" to={`/centre/${id}/${sessionId}/general`} />
            <TabItem icon={<PencilAlt />} title="Tableau de pointage" to={`/centre/${id}/${sessionId}/tableau-de-pointage`} />
            <TabItem icon={<ShieldCheck />} title="Fiche sanitaire" to={`/centre/${id}/${sessionId}/fiche-sanitaire`} />
          </nav>
        </div>
        <div className="bg-white pt-4">
          {currentTab === "general" && <General />}
          {currentTab === "tableau-de-pointage" && <Pointage />}
          {currentTab === "fiche-sanitaire" && <FicheSanitaire />}
        </div>
      </div>
      <ModalExportMail isOpen={modalExportMail?.isOpen} onCancel={() => setModalExportMail({ isOpen: false, value: null })} onSubmit={modalExportMail?.onSubmit} />
    </>
  );
}

const TabItem = ({ to, title, icon }) => (
  <NavLink
    to={to}
    activeClassName="!text-snu-purple-800 bg-white border-none"
    className="text-[13px] px-3 py-2 cursor-pointer text-gray-600 rounded-t-lg bg-gray-50 border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 hover:text-snu-purple-800">
    <div className="flex items-center gap-2">
      {icon} {title}
    </div>
  </NavLink>
);
