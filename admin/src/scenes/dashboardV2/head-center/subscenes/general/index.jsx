import React, { useState, useEffect } from "react";

import { HiChevronDown, HiChevronRight, HiChevronUp } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { ROLES, translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import DashboardContainer from "../../../components/DashboardContainer";
import KeyNumbers from "../../../components/KeyNumbers";
import InfoMessage from "../../../components/ui/InfoMessage";
import { Link } from "react-router-dom";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState([]);

  useEffect(() => {
    const updateStats = async (id) => {
      const response = await api.post("/elasticsearch/dashboard/general/todo", { filters: { meetingPointIds: [id], cohort: [] } });
      const s = response.data;
      setStats(s);
    };
    updateStats();
  }, []);

  const getMessage = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/alerte-message`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
      }
      setMessage(response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des messages");
    }
  };

  useEffect(() => {
    getMessage();
  }, []);

  return (
    <DashboardContainer active="general" availableTab={["general", "sejour"]}>
      <div className="flex flex-col gap-8 mb-4">
        {message?.length ? message.map((hit) => <InfoMessage key={hit._id} data={hit} />) : null}
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
        <div className="flex w-full gap-4">
          <Actus stats={stats} user={user} />
          <KeyNumbers role={user.role} />
        </div>
      </div>
    </DashboardContainer>
  );
}

const NotePlaceholder = () => {
  return (
    <div className="flex h-36 w-full items-center justify-center rounded-lg bg-gray-50">
      <div className="text-sm text-center text-gray-400">Aucune notification</div>
    </div>
  );
};

const NoteContainer = ({ title, number, content, btnLabel, link }) => {
  return (
    <div className="flex h-36 w-full flex-col justify-between rounded-lg bg-blue-50 py-3.5 px-3 col-span-1">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5 text-gray-900">{title}</span>
        <p className="text-xs font-normal leading-4 text-gray-900">
          <span className="font-bold text-blue-600">{Number(number) >= 1000 ? "1000+" : number} </span>
          {content}
        </p>
      </div>
      {link && (
        <div className="flex justify-end">
          <Link className="flex items-center gap-2 rounded-full bg-blue-600 py-1 pr-2 pl-3 text-xs font-medium text-white" to={link}>
            <span>{btnLabel}</span>
            <HiChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

function Actus({ stats }) {
  const [fullNote, setFullNote] = useState(false);

  function shouldShow(parent, key, index = null) {
    true;
    if (fullNote) return true;

    const entries = Object.entries(parent);
    for (let i = 0, limit = 0; i < entries.length && limit < 9; i++) {
      if (Array.isArray(entries[i][1])) {
        for (let j = 0; j < entries[i][1].length && limit < 9; j++) {
          if (entries[i][0] === key && index === j) return true;
          limit++;
        }
      } else {
        if (entries[i][0] === key) return true;
        limit++;
      }
    }
    return false;
  }
  function total(parent) {
    const entries = Object.entries(parent);
    let limit = 0;
    for (let i = 0; i < entries.length; i++) {
      if (Array.isArray(entries[i][1])) {
        for (let j = 0; j < entries[i][1].length; j++) limit++;
      } else limit++;
    }
    return limit;
  }

  if (!stats.engagement)
    return (
      <div className={`flex w-[70%] flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] h-[584px]"}`}>
        <div className="text-slate-300 py-8 m-auto text-center animate-pulse text-xl">Chargement des actualités</div>
      </div>
    );

  return (
    <div className={`flex w-[70%] flex-col gap-4 rounded-lg bg-white px-4 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ${!fullNote ? "h-[584px]" : "h-fit"}`}>
      <div className="flex items-center gap-3">
        <div className="text-sm font-bold leading-5 text-gray-900">A faire</div>
        <div className="rounded-full bg-blue-50 px-2.5 pt-0.5 pb-1 text-sm font-medium leading-none text-blue-600">{total(stats.engagement)}</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {!total(stats.engagement) && <NotePlaceholder />}
        {stats.sejour.sejour_rassemblement_non_confirmé.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_rassemblement_non_confirmé", key) && (
              <NoteContainer
                title="Point de rassemblement"
                key={"sejour_rassemblement_non_confirmé" + item.cohort}
                number={item.count}
                content={`volontaires n'ont pas confirmé leur point de rassemblement pour le séjour de ${item.cohort}`}
                link={`/volontaire?status=VALIDATED&hasMeetingInformation=false~N/A&statusPhase1=AFFECTED&cohort=${item.cohort}`}
                btnLabel="À déclarer"
              />
            ),
        )}
        {stats.sejour.sejour_participation_non_confirmée.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_participation_non_confirmée", key) && (
              <NoteContainer
                title="Point de rassemblement"
                key={"sejour_participation_non_confirmée" + item.cohort}
                number={item.count}
                content={`volontaires n'ont pas confirmé leur participation pour le séjour de ${item.cohort}`}
                link={`/volontaire?status=VALIDATED&youngPhase1Agreement=false~N/A&statusPhase1=AFFECTED&cohort=${item.cohort}`}
                btnLabel="À déclarer"
              />
            ),
        )}
        {stats.sejour.sejour_point_de_rassemblement_à_déclarer.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_point_de_rassemblement_à_déclarer", key) && (
              <NoteContainer
                title="Point de rassemblement"
                key={"sejour_point_de_rassemblement_à_déclarer" + item.cohort + item.department}
                number=""
                content={`Au moins 1 point de rassemblement est à déclarer pour le séjour de ${item.cohort} (${item.department})`}
                link={`/point-de-rassemblement/liste/liste-points?cohort=${item.cohort}&department=${item.department}`}
                btnLabel="À déclarer"
              />
            ),
        )}
        {stats.sejour.sejour_emploi_du_temps_non_déposé.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_emploi_du_temps_non_déposé", key) && (
              <NoteContainer
                title="Emploi du temps"
                key={"sejour_emploi_du_temps_non_déposé" + item.cohort}
                number={item.count}
                content={`emplois du temps n'ont pas été déposés. ${item.cohort}`}
                link={`/centre/liste/session?hasTimeSchedule=false&cohort=${item.cohort}`}
                btnLabel="À relancer"
              />
            ),
        )}
        {stats.sejour.sejour_contact_à_renseigner.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_contact_à_renseigner", key) && (
              <NoteContainer
                title="Contact"
                key={"sejour_contact_à_renseigner" + item.cohort + item.department}
                number=""
                content={`Au moins 1 contact de convocation doit être renseigné pour le séjour de ${item.cohort} (${item.department})`}
                btnLabel="À renseigner"
              />
            ),
        )}
        {stats.sejour.sejour_volontaires_à_contacter.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_volontaires_à_contacter", key) && (
              <NoteContainer
                title="Cas particuliers"
                key={"sejour_volontaires_à_contacter" + item.cohort}
                number={item.count}
                content={`volontaires à contacter pour préparer leur accueil pour le séjour de ${item.cohort}`}
                link={null}
                btnLabel="À contacter"
              />
            ),
        )}
        {stats.sejour.sejour_chef_de_centre.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_chef_de_centre", key) && (
              <NoteContainer
                title="Chef de centre"
                key={"sejour_chef_de_centre" + item.cohort}
                number={item.count}
                content={`chefs de centre sont à renseigner pour le séjour de  ${item.cohort}`}
                link={`centre/liste/session?headCenterExist=false&cohort=${item.cohort}`}
                btnLabel="À renseigner"
              />
            ),
        )}
        {stats.sejour.sejour_centre_à_déclarer.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejour_centre_à_déclarer", key) && (
              <NoteContainer
                title="Centre"
                key={"sejour_centre_à_déclarer" + item.cohort + item.department}
                number=""
                content={`Au moins 1 centre est en attente de déclaration pour le séjour de ${item.cohort} (${item.department})`}
                link={`/centre/liste/session?cohort=${item.cohort}&department=${item.department}`}
                btnLabel="À déclarer"
              />
            ),
        )}
        {stats.sejour.sejourPointage.map(
          (item, key) =>
            shouldShow(stats.sejour, "sejourPointage", key) && (
              <NoteContainer
                title="Pointage"
                key={"sejourPointage" + item.cohort}
                number={item.count}
                content={`centres n'ont pas pointés tous leurs volontaires à l'arrivée au séjour de ${item.cohort}`}
                link={null}
                btnLabel="À renseigner"
              />
            ),
        )}
        {/* ON A PLUS LA JDM DE MEMOIRE */}
        {/* {stats.sejour.sejour_pointage_jdm.map(
            (item, key) =>
              shouldShow(stats.sejour, "sejour_pointage_jdm", key) && (
                <NoteContainer
                  title="Pointage"
                  key={"sejour_pointage_jdm" + item.cohort}
                  number={item.count}
                  content={`centres n'ont pas pointés tous leurs volontaires à la JDM sur le séjour de ${item.cohort}`}
                  link={null}
                  btnLabel="À renseigner"
                />
              ),
          )} */}
      </div>
      {stats?.engagement.length > 9 ? (
        <div className="flex justify-center">
          <button className="flex items-center gap-1 text-sm text-blue-600" onClick={() => setFullNote(!fullNote)}>
            <span>{fullNote ? "Voir moins" : "Voir plus"}</span>
            {fullNote ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
