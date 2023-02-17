import React, { useContext, useEffect, useState } from "react";
import { StructureContext } from "../../view";
import API from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { ES_NO_LIMIT } from "snu-lib";
import TeamModal from "../modals/TeamModal";
import { getInitials } from "../../../../utils";
import Card from "../Card";
import { NavLink } from "react-router-dom";
import Eye from "../../../../assets/icons/Eye";
import ReactTooltip from "react-tooltip";

export default function TeamCard() {
  const { structure } = useContext(StructureContext);
  const [isOpen, setIsOpen] = useState(false);
  const [team, setTeam] = useState([]);

  const getTeam = async (structureId) => {
    try {
      const query = { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structureId } }] } };
      const { responses } = await API.esQuery("referent", { query, size: ES_NO_LIMIT });
      if (responses.length) return responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      const data = await getTeam(structure._id);
      if (!data) return toastr.error("Erreur", "Une erreur est survenue lors de la récupération des responsables.", { timeOut: 10000, progressBar: true });
      setTeam(data);
    })();
  }, [structure]);

  if (!team?.length) return <div />;
  return (
    <>
      <Card className="w-64">
        <div className="relative h-full">
          <div>
            <div
              onClick={() => setIsOpen(true)}
              className="absolute right-0 m-4 flex justify-center items-center h-8 w-8 bg-gray-100 !text-gray-600 rounded-full hover:scale-105 cursor-pointer border-[1px] border-gray-100 hover:border-gray-300"
              data-tip=""
              data-for="tooltip-application">
              <Eye width={16} height={16} />
            </div>
            <ReactTooltip id="tooltip-application" type="light" place="top" effect="solid" className="shadow-xl custom-tooltip-radius" tooltipRadius="6">
              <div className="text-xs">Voir l&apos;équipe</div>
            </ReactTooltip>
          </div>
          {/* <div
            className="flex items-center absolute py-6 px-7 bg-black w-full h-full rounded-xl opacity-0 hover:opacity-50 cursor-pointer z-20 transition"
            onClick={() => setIsOpen(true)}>
            <p className="text-white text-sm m-auto">Voir la liste complète</p>
          </div> */}
          <div className="absolute my-6 px-7">
            <p className="mb-1 text-sm">L&apos;équipe</p>
            <p className="text-gray-500 text-xs">
              {team.length} {structure.isNetwork ? "membre" : "responsable"}
              {team.length > 1 && "s"}
            </p>
            <div className="flex flex-row mt-4 -space-x-2">
              {team.map((contact, index) => {
                if (index < 6)
                  return (
                    <div key={index} className={`h-8 w-8 flex justify-center items-center rounded-full bg-gray-100 text-blue-600 text-xs border-2 border-white`}>
                      {getInitials(contact.firstName + " " + contact.lastName)}
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </Card>
      {/* <Card className="w-64">
        <div className="relative h-full">
          <div
            className="flex items-center absolute py-6 px-7 bg-black w-full h-full rounded-xl opacity-0 hover:opacity-50 cursor-pointer z-20 transition"
            onClick={() => setIsOpen(true)}>
            <p className="text-white text-sm m-auto">Voir la liste complète</p>
          </div>
          <div className="absolute my-6 px-7">
            <p className="mb-1 text-sm">L&apos;équipe</p>
            <p className="text-gray-500 text-xs">
              {team.length} {structure.isNetwork ? "membre" : "responsable"}
              {team.length > 1 && "s"}
            </p>
            <div className="flex flex-row mt-4 -space-x-2">
              {team.map((contact, index) => {
                if (index < 6)
                  return (
                    <div key={index} className={`h-8 w-8 flex justify-center items-center rounded-full bg-gray-100 text-blue-600 text-xs border-2 border-white`}>
                      {getInitials(contact.firstName + " " + contact.lastName)}
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </Card> */}
      <TeamModal isOpen={isOpen} onCancel={() => setIsOpen(false)} team={team} setTeam={setTeam} />
    </>
  );
}
